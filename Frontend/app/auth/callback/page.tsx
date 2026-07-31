"use client";

import DashboardPage from "@/app/(autheticated)/dashboard/page";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function Callback() {

    useEffect(() => {

        async function completeLogin() {

            const {
                data,
            } = await supabase.auth.getSession();

            if (!data.session) return;

            await fetch(
                "http://localhost:3001/auth/google/complete",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${data.session.access_token}`,
                    },
                },
            );

            window.location.href = "/";

        }

        completeLogin();

    }, []);

    return <><DashboardPage /></>;

}