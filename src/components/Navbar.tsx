'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { io, Socket } from 'socket.io-client';
import { Badge } from './ui/badge';
import { useSocket } from '@/context/SocketProvider';

const socket: Socket = io('http://localhost:3001');

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  // const [isConnected, setIsConnected] = useState(false);
  const { socket, isConnected } = useSocket() || {};


  // useEffect(() => {
  //   const handleConnect = () => {
  //     console.log('Connected to server');
  //     setIsConnected(true);
  //   };
  //   const handleDisconnect = () => {
  //     console.log('Disconnected from server');
  //     setIsConnected(false);
  //   };

  //   socket.on('connect', handleConnect);
  //   socket.on('disconnect', handleDisconnect);

  //   // Listen for new row data
  //   socket.on('newFlight', (rowData) => {
  //     console.log('Received newRow:', rowData);
  //     // setRows((prevRows) => [...prevRows, rowData]);
  //   });

  //   // Clean up the event listeners on component unmount
  //   return () => {
  //     socket.off('connect', handleConnect);
  //     socket.off('disconnect', handleDisconnect);
  //     socket.off('newRow');
  //   };
  // }, []);

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          Flight System
        </a>
        <div>
          {session ? (
            <>
              <span className="mr-4">
                Welcome, {user.username || user.email}
              </span>
              <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
            </Link>
          )}
          <Badge variant="outline" className={`text-white p-3 m-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
