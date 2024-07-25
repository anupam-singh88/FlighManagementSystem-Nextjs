import dbConnect from "@/lib/dbConnect";
import Airline from "@/model/Airline";
import FlightModel from "@/model/Flight";

export async function GET(request: Request) {
    await dbConnect();

    const url = new URL(request.url);
    const query = url.searchParams;

    const filters: any = {};
    if (query.has('number') && query.get('number')) {
        filters.number = { $regex: query.get('number'), $options: 'i' };
    }
    if (query.has('origin') && query.get('origin')) {
        filters.origin = { $regex: query.get('origin'), $options: 'i' };
    }
    if (query.has('destination') && query.get('destination')) {
        filters.destination = { $regex: query.get('destination'), $options: 'i' };
    }
    if (query.has('airline') && query.get('airline')) {
        const airlineName = query.get('airline');
        const airline = await Airline.findOne({ name: { $regex: airlineName, $options: 'i' } });
        if (airline) {
            filters.airline = airline._id;
        }
    }

    try {
        const flightData = await FlightModel.find(filters)
            .populate('status', 'status') 
            .populate('airline', 'name'); 
        
        const transformedData = flightData.map(flight => ({
            _id: flight._id,
            number: flight.number,
            origin: flight.origin,
            destination: flight.destination,
            departure_time: flight.departure_time,
            status: flight.status.status, 
            airline: flight.airline.name, 
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
