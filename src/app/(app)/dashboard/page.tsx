'use client';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import io from 'socket.io-client';
import { useForm } from "react-hook-form";
import flightData from '@/flightData.json';
import { addRandomFlights, generateRandomFlight, getFlightsData } from "@/lib/actions/flight-actions";
// import { useSocket } from "@/context/socket-provider";

// Define the Flight type
interface Flight {
  _id: string
  number: string;
  origin: string;
  destination: string;
  departure_time: string;
  status: string;
  airline?: string; // Optional if not always available
  type?: string; // Optional if not always available
}

const ITEMS_PER_PAGE = 10;

function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ airline: '', flightType: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
const [editingStatus,setEditingStatus]=useState(false);

const STATUS_OPTIONS= [
  "Delayed",
  "Cancelled",
  "In-flight",
  "Scheduled/En-Route",
]
  // const {socket}=useSocket()

  const form = useForm();

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/flight-data");
      console.log("🚀 ~ fetchFlights ~ response:", response.data.data);
      setFlights(response.data.data);
      // setFlights()
    } catch (error) {
      const axiosError = error as AxiosError;
      toast({
        title: "Error",
        description: "Failed to fetch flights",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFlights();
    // generateRandomFlight()
    addRandomFlights()
  }, [fetchFlights]);

  function formatDateTime(isoString : any) {
    const date = new Date(isoString);
    const formattedDate = date.toISOString().split('T')[0]; // Extracts the date part
    const formattedTime = date.toISOString().split('T')[1].split('.')[0]; // Extracts the time part without milliseconds
    return `${formattedDate} ${formattedTime}`;
  }
  
  const isoString = "2024-07-25T00:00:02.246Z";
  console.log(formatDateTime(isoString)); // Output: "2024-07-25 00:00:02"
  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredFlights = flights.filter(flight => {
    return (
      (flight.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.airline ? flight.airline === filters.airline : true) &&
      (filters.flightType ? flight.type === filters.flightType : true) &&
      (filters.status ? flight.status === filters.status : true)
    );
  });

  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFlights = filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Flight Management Dashboard</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Search Flights</h2>
        <input
          type="text"
          placeholder="Search by number, origin, or destination"
          value={searchTerm}
          onChange={handleSearchChange}
          className="input input-bordered w-full p-2 mb-2"
        />
        <div className="flex space-x-4 mb-4">
          <select
            name="airline"
            value={filters.airline}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Airlines</option>
            <option value="Delta">Delta</option>
            <option value="United">United</option>
            {/* Add more airlines */}
          </select>
          <select
            name="flightType"
            value={filters.flightType}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Types</option>
            <option value="Commercial">Commercial</option>
            <option value="Military">Military</option>
            <option value="Private">Private</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Statuses</option>
            <option value="On Time">On Time</option>
            <option value="Delayed">Delayed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={() => fetchFlights()}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Departure Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFlights.map((flight) => (
              <tr key={flight.number}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{flight.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.origin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime( flight.departure_time)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {true? (
                    <select
                      value={flight.status}
                      // onChange={(e) => handleStatusChange(flight._id, e.target.value)}
                      className="p-2 border border-gray-300 rounded w-full"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    flight.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Page;

