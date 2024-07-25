'use client';

import TableComponent from '@/components/TableComponent';
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const socket: Socket = io('http://localhost:3001');
interface Status {
  _id: string;
  status: string;
}
interface Flight {
  _id: string
  number: string;
  origin: string;
  destination: string;
  departure_time: string;
  status: Status;
  airline?: string;
  type?: string;
}
const ITEMS_PER_PAGE = 10;


export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();


  const [filters, setFilters] = useState({
    number: '',
    origin: '',
    destination: '',
    status: '',
    airline: '',
    flightType: '',
  });
  const filteredFlights = flights.filter(flight => {
    return (
      (flight.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.airline ? flight.airline === filters.airline : true) &&
      (filters.flightType ? flight.type === filters.flightType : true)
      // (filters.status.status ? flight.status.status === filters.status.status : true)
    );
  });

  const fetchFlights = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/flight-data", { params });
      await statusList()
      // console.log("🚀 ~ fetchFlights ~ response:", response.data.data);
      setFlights(response.data.data);
      return response.data;
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
    // statusList();
    // socket.on('flight', (data: any) => {
    //   console.log("🚀 ~ socket.on ~ data", data)
    //   fetchFlights();

  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFlights = filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const statusList = async () => {
    try {
      const response = await axios.get("/api/airline-status");
      // console.log("🚀 ~ statusList ~ response", response.data.data);
      setStatus(response.data.data)
      return response.data.data;

    } catch (error) {
      console.log("🚀 ~ statusList ~ error:", error);

    }
  }
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white">
        {/* <section className="text-center mb-8 md:mb-12"> */}
        {/* <p className="mt-3 md:mt-4 text-base md:text-lg">
            Flight Management Software - Built On NextJS
          </p> */}
        {isLoading ? <>
          <Loader2 className=" h-10 w-10 animate-spin" />
          <p className="text-center text-xl">Loading...</p>
        </> :
          <>
            <TableComponent currentFlights={currentFlights} status={status} fetchFlights={fetchFlights} />
            {/* </section> */}
            <div className="flex justify-between items-center mt-4 w-full">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                className='text-black'
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="destructive"
              >
                Next
              </Button>
            </div>
          </>
        }

      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
        © 2024 Pikky AssignMent. All rights reserved.
      </footer>
    </>
  );
}

