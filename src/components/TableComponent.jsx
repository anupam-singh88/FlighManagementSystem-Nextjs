import React from 'react'
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";


const TableComponent = ({ currentFlights, status, isAdmin = false, fetchFlights }) => {
    const { toast } = useToast();


    function formatDateTime(isoString) {
        const date = new Date(isoString);
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toISOString().split('T')[1].split('.')[0];
        return `${formattedDate} ${formattedTime}`;
    }

    return (
        <>
            {
                currentFlights && (
                    <table className="min-w-full divide-y divide-gray-200">
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
                                        {isAdmin ? (
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
                                                    console.log(statusItem, flight.status)
                                                    console.log(flight.status || flight.status._id)
                                                    return (
                                                        <option key={statusItem._id} value={statusItem._id}>
                                                            {statusItem.status}
                                                        </option>
                                                    )
                                                })}
                                            </select>

                                        ) : (
                                            flight.status
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        </>
    )
}

export default TableComponent
