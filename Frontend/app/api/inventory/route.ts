import { base_url } from "@/app/constants/api"

export async function GET(req: Request) {
    const auth = req.headers.get("Authorization")

    if(!auth){
        return Response.json({
            status: 401,
            message: "Unauthorized please log in"
        })
    }

    const response = await fetch(`${base_url}/inventory`, {
        method: "GET",
        headers: {
            Authorization: auth
        }
    })

    const data = await response.json();
    return Response.json(data, {
        status: response.status
    })
    
}

export async function POST(req: Request){
    const auth = req.headers.get("Authorization")
    if(!auth){
        return Response.json({
            status: 401,
            message: "Unauthorized please log in",
        })
    }

    const body = await req.json()
    const response = await fetch(`${base_url}/inventory`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: auth,
        },
        body: JSON.stringify(body)
    })

    const data = await response.json()

    return Response.json(data, {
        status: response.status
    })
}