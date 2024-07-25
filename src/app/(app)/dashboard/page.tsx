'use client';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import flightData from '@/flightData.json';
import { addRandomFlights, generateRandomFlight, } from "@/lib/actions/flight-actions";
import { useDebounce } from "usehooks-ts";
import Select from 'react-select/async';
import debounce from 'lodash.debounce';
import FlightStatus from "@/model/FlightStatus";
import { io, Socket } from 'socket.io-client';
import TableComponent from '@/components/TableComponent'
import { useSocket } from "@/context/SocketProvider";
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

const socket: Socket = io('http://localhost:3001');


const ITEMS_PER_PAGE = 10;

function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [editingStatus, setEditingStatus] = useState(false);
  const [airlineList, setArilineList] = useState([])
  const [status, setStatus] = useState<Status[]>([]);
  const [origin, setOrigin] = useState('');
  const [filters, setFilters] = useState({
    number: '',
    origin: '',
    destination: '',
    status: '',
    airline: '',
    flightType: '',
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  // const socket = useSocket();
  const { socket, isConnected } = useSocket() || {};


  useEffect(() => {
    if (!socket) return;

    socket.on('newFlight', (rowData) => {
      console.log('Received newRow:', rowData);
      setFlights((prevFlights) => {
        const flightExists = prevFlights.some(flight => flight._id === rowData._id);
        if (!flightExists) {
          return [rowData, ...prevFlights];
        }
        return prevFlights;
      });
    });

    return () => {
      socket.off('newFlight');
    };
  }, [socket]);


  // useEffect(() => {
  //   socket.on('connect', () => {
  //     console.log('Connected to server');
  //   });
  //   socket.on('disconnect', () => {
  //     console.log('Disconnected from server');
  //   });

  //   socket.on('newFlight', (rowData) => {
  //     console.log('Received newRow:', rowData);
  //     setFlights((prevFlights) => {
  //       // Check if the flight already exists in the state
  //       const flightExists = prevFlights.some(flight => flight._id === rowData._id);
  //       if (!flightExists) {
  //         return [rowData, ...prevFlights];
  //       }
  //       return prevFlights;
  //     });
  //   });

  //   return () => {
  //     socket.off('connect');
  //     socket.off('disconnect');
  //     socket.off('newFlight');
  //   };
  // }, []);
  const debouncedOrigin = useDebounce(filters.origin, 300)


  const STATUS_OPTIONS = [
    "Delayed",
    "Cancelled",
    "In-flight",
    "Scheduled/En-Route",
  ]


  const form = useForm();

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedOrigin) {
        // setIsCheckingUsername(true);
        setOrigin(''); // Reset message
        try {
          const response = await fetchFlights({
            origin: debouncedOrigin
          })
          console.log(response)
          // setOrigin(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          // setOrigin(
          //   axiosError.response?.data.message ?? 'Error checking username'
          // );
        } finally {
          // setOrigin(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedOrigin]);

  const getAirlineList = async () => {
    try {
      const response = await axios.get("/api/airline");
      // console.log("🚀 ~ getAirlineList ~ response", response.data.data);
      setArilineList(response.data.data)
      return response.data.data;
    } catch (error) {
      console.log("🚀 ~ getAirlineList ~ error", error)

    }
  }

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

  function formatDateTime(isoString: any) {
    const date = new Date(isoString);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toISOString().split('T')[1].split('.')[0];
    return `${formattedDate} ${formattedTime}`;
  }

  const fetchFlights = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/flight-data", { params });
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
  const loadOptions = async (inputValue: string, endpoint: string) => {
    const response = await fetchFlights({
      [endpoint]: inputValue
    });

    // Ensure response.data is an array
    const data = Array.isArray(response.data)
      ? response.data.map((item: any) => ({ value: item[endpoint], label: item[endpoint] }))
      : [];

    return data;
  };



  const debouncedLoadOptions = useCallback(debounce(loadOptions, 300), []);


  useEffect(() => {
    fetchFlights();
    // addRandomFlights()
    getAirlineList()
    statusList()
  }, [fetchFlights]);

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

  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFlights = filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  const handleSearch = () => {
    fetchFlights(filters);
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard - You can change flight status</h1>


      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Search Flights</h2>
        <div className="flex flex-wrap space-x-4 mb-4">
          <Select
            name="number"
            placeholder="Search by number"
            loadOptions={async (inputValue) => await debouncedLoadOptions(inputValue, 'number')}
            onChange={(e: any) => {
              // console.log("🚀 ~ e", e)
              setFilters({
                ...filters,
                number: e.value
              })
            }}
            className="flex-grow mb-2"
          />
          <Select
            name="origin"
            placeholder="Search by origin"
            loadOptions={async (inputValue) => await debouncedLoadOptions(inputValue, 'origin')}
            // onChange={handleInputChange}
            className="flex-grow mb-2"
          />
          <Select
            name="destination"
            placeholder="Search by destination"
            loadOptions={async (inputValue) => {
              const data = await debouncedLoadOptions(inputValue, 'destination')
              return data
            }}
            className="flex-grow mb-2"
          />
          <select
            name="airline"
            onChange={async (e) => {
              const selectedValue = e.target.value;
              await fetchFlights({
                airline: selectedValue
              })
            }}
            className="select select-bordered p-2 mb-2 flex-grow border-2"
          >
            <option value="" disabled selected>Select Airline</option>
            {
              airlineList && airlineList.map((airline: any) => (
                <option key={airline._id} value={airline.name}>{airline.name}</option>
              ))
            }
          </select>

          <button onClick={handleSearch} className="btn btn-primary p-2 mb-2 flex-grow border-2">
            Search
          </button>
          <button onClick={() => {
            setFilters({
              number: '',
              origin: '',
              destination: '',
              status: '',
              airline: '',
              flightType: '',
            })
            fetchFlights()
          }} className="btn btn-primary p-2 mb-2 flex-grow border-2">
            Clear
          </button>
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
        {/* <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airline</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{flight.airline}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.origin}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.destination}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(flight.departure_time)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {true ? (
                    <select
                      value={flight.status._id}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        axios.post(`/api/update-status/${flight._id}/${selectedValue}`)
                          .then(response => {
                            // console.log("🚀 ~ response", response);
                            fetchFlights()
                            toast({
                              title: "Success",
                              description: "Flight status updated",
                              variant: "default"
                            });
                          })
                          .catch(error => {
                            // console.log("🚀 ~ error", error);
                            toast({
                              title: "Error",
                              description: "Failed to update flight status",
                              variant: "destructive"
                            });
                          });
                      }}
                      className="p-2 border border-gray-300 rounded w-full"
                    >
                      {status.map((statusItem) => {
                        // console.log(statusItem, flight.status)
                        return (
                          <option key={statusItem._id} value={statusItem._id}>
                            {statusItem.status}
                          </option>
                        )
                      })}
                    </select>

                  ) : (
                    flight.status.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}
        <TableComponent currentFlights={currentFlights} status={status} isAdmin={true} fetchFlights={fetchFlights} />
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

