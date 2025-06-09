// // app/api/users/route.js
// import { NextResponse } from "next/server";
// import { executeQuery } from "@/lib/db";

// export async function GET(request) {
//   try {
//     // Get query parameters
//     const { searchParams } = new URL(request.url);
//     const username = searchParams.get('username');
    
//     let query = "SELECT * FROM users";
//     let params = [];
    
//     // Filter by username if provided
//     if (username) {
//       query = "SELECT * FROM users WHERE username = ?";
//       params = [username];
//     }
    
//     // Execute the query with any parameters
//     const users = await executeQuery(query, params);

//     // Return the users as a JSON response
//     return NextResponse.json(users);
//   } catch (error) {
//     console.error("API Error fetching users:", error);
//     // Return an error response
//     return NextResponse.json(
//       { message: "Failed to fetch users", error: error.message },
//       { status: 500 } // Internal Server Error
//     );
//   }
// }

// // You can add other HTTP method handlers (POST, PUT, DELETE) here later
// // export async function POST(request) { ... }
// // export async function PUT(request) { ... }
// // export async function DELETE(request) { ... }