import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db"; // Use alias @ for cleaner imports if jsconfig.json is set up

export async function GET(request) {
  try {
    // Fetch all users from the database
    const users = await executeQuery("SELECT * FROM users");

    // Return the users as a JSON response
    return NextResponse.json(users);
  } catch (error) {
    console.error("API Error fetching users:", error);
    // Return an error response
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 } // Internal Server Error
    );
  }
}

// You can add other HTTP method handlers (POST, PUT, DELETE) here later
// export async function POST(request) { ... }
// export async function PUT(request) { ... }
// export async function DELETE(request) { ... }
