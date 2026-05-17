"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {

  const [users, setUsers] = useState<any[]>([]);

  async function loadUsers() {

    try {

      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      }

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (

    <div style={{
      background:"#081224",
      minHeight:"100vh",
      color:"white",
      padding:"30px"
    }}>

      <h1 style={{
        fontSize:"32px",
        marginBottom:"30px"
      }}>
        Admin Dashboard
      </h1>

      <div style={{
        background:"#111c33",
        padding:"20px",
        borderRadius:"10px"
      }}>

        <h2 style={{ marginBottom:"20px" }}>
          Users
        </h2>

        <table width="100%">

          <thead>
            <tr>
              <th align="left">Username</th>
              <th align="left">Password</th>
              <th align="left">Role</th>
              <th align="left">Credits</th>
            </tr>
          </thead>

          <tbody>

            {users.map((user, index) => (

              <tr key={index}>

                <td>{user.username}</td>
                <td>{user.password}</td>
                <td>{user.role}</td>
                <td>{user.credits}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}
