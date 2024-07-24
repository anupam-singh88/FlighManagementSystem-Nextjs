import dbConnect from '@/lib/dbConnect';
import FlightModel from '@/model/Flight';

export async function POST(
  request: Request,
  { params }: { params: { flightId: string; status: string; } }
) {
  await dbConnect();

  try {
    const { flightId, status } = params;

    const updatedFlight = await FlightModel.findByIdAndUpdate(
      flightId,
      { status },
      { new: true }
    );

    if (!updatedFlight) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Flight not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedFlight,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating flight status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error updating flight status',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
