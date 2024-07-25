import dbConnect from "@/lib/dbConnect";
import FlightStatus from "@/model/FlightStatus";

export async function GET(request: Request) {
    await dbConnect();

    try {
        const statuses = await FlightStatus.find({}, 'status'); 
        return new Response(JSON.stringify({
            success: true,
            data: statuses
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error) {
        console.log("Error getting flight statuses", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error getting flight statuses"
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
