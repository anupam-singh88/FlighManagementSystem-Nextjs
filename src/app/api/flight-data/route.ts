import dbConnect from "@/lib/dbConnect";
import Airline from "@/model/Airline";
import FlightModel from "@/model/Flight";

export async function GET(request: Request) {
    await dbConnect();

    const url = new URL(request.url);
    const query = url.searchParams;

    const filters: any = {};
    if (query.has('number')) {
        filters.number = { $regex: query.get('number'), $options: 'i' };
    }
    if (query.has('origin')) {
        filters.origin = { $regex: query.get('origin'), $options: 'i' };
    }
    if (query.has('destination')) {
        filters.destination = { $regex: query.get('destination'), $options: 'i' };
    }
    if (query.has('airline')) {
        const airlineName = query.get('airline');
        const airline = await Airline.findOne({ name: { $regex: airlineName, $options: 'i' } });
        if (airline) {
            filters.airline = airline._id;
        }
    }

    try {
        const flightData = await FlightModel.find(filters)
            .populate('status', 'status') // Populate status and select only the status field
            .populate('airline', 'name'); // Populate airline and select only the name field
        
        // Transform the data to include only the status and airline names
        const transformedData = flightData.map(flight => ({
            _id: flight._id,
            number: flight.number,
            origin: flight.origin,
            destination: flight.destination,
            departure_time: flight.departure_time,
            status: flight.status, // Only the status string
            airline: flight.airline.name, // Only the airline name
            createdAt: flight.createdAt,
            updatedAt: flight.updatedAt,
            __v: flight.__v
        }));

        return new Response(JSON.stringify({
            success: true,
            data: transformedData
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error) {
        console.log("Error getting flight data", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error getting flight data"
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
