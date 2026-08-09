export async function POST(req: Request) {
    const base_url = process.env.NEXT_PUBLIC_BASE_URL;
    const body =  await req.json();

    const response = await fetch(`${base_url}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })

    const data = await response.json()

    return Response.json(data, {
        status: response.status
    })
}

// export async function POST() {
//   return Response.json({
//     message: "Signup route works!",
//   });
// }