import dbConnect from "@/lib/dbConnect";
import Airline from "@/model/Airline";

export async function GET(request: Request) {
    await dbConnect();

    try {
        const airlines = await Airline.find({}, 'name');
        return new Response(JSON.stringify({
            success: true,
            data: airlines
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error) {
        console.log("Error getting airlines data", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error getting airlines data"
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
