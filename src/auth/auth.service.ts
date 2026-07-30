import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) { }

    health() {
        return {
            message: 'Auth service is working',
        }
    }

    async register(dto: RegisterDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        try {

            // await supabase.from('users').insert({
            //     id: data.user.id,
            //     email: dto.email,
            //     full_name: dto.fullName,
            //     phone_number: dto.phoneNumber,
            //     market_location: dto.marketLocation,
            // });

            await this.prisma.users.create({
                data: {
                    id: data.user.id,
                    email: dto.email,
                    full_name: dto.fullName,
                    phone_number: dto.phoneNumber,
                    market_location: dto.marketLocation,
                }
            })

            return {
                message: 'User registered successfully',
                user: data.user,
            };
        } catch (err) {
            await supabase.auth.admin.deleteUser(data.user.id)

            throw new InternalServerErrorException(
                'Failed to create user profile',
            );
        }
    }


    async login(dto: LoginDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: dto.email,
                password: dto.password,
            });

        if (error || !data.session) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const profile = await this.prisma.users.findUnique({
            where: {
                id: data.user.id,
            },
        });

        if (!profile) {
            throw new NotFoundException(
                'User profile not found',
            );
        }

        return {
            message: 'Login successful',
            data: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresIn: data.session.expires_in,
                user: profile,
            },
        };
    }
}
