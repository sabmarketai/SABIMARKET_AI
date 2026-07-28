import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly supabaseService: SupabaseService,
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

        await supabase.from('users').insert({
            id: data.user.id,
            email: dto.email,
            full_name: dto.fullName,
            phone_number: dto.phoneNumber,
            market_location: dto.marketLocation,
        });

        return {
            message: 'User registered successfully',
            user: data.user,
        };
    }
}
