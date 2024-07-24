import dbConnect from "@/lib/dbConnect";
import FlightModel from "@/model/Flight";

export async function GET(request: Request) {
    await dbConnect();

    try {
        const flightData = await FlightModel.find().populate('status');
        
        // Transform the data to include only the status string
        const transformedData = flightData.map(flight => ({
            _id: flight._id,
            number: flight.number,
            origin: flight.origin,
            destination: flight.destination,
            departure_time: flight.departure_time,
            status: flight.status.status, // Only the status string
            createdAt: flight.createdAt,
            updatedAt: flight.updatedAt,
            __v: flight.__v
        }));

        return new Response(JSON.stringify({
            success: true,
            data: transformedData
        }), { status: 200 });
    } catch (error) {
        console.log("Error getting flight data", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error getting flight data"
        }), { status: 500 });
    }
}
