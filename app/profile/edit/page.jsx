// app/profile/edit/page.jsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { executeQuery } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import BioTextarea from "@/components/BioTextarea";
import BackButton from "@/components/BackButton";
import { put } from "@vercel/blob";

// Maximum file sizes
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_COVER_SIZE = 4 * 1024 * 1024; // 4MB

// Process profile updates
async function updateProfile(formData) {
  "use server";

  try {
    // Get current user session
    const session = await auth();
    if (!session || !session.user) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;
    const username = formData.get("username");
    const bio = formData.get("bio") || "";

    // Validate inputs - no changes here
    if (!username || username.length < 3 || username.length > 30) {
      return { error: "Username must be between 3 and 30 characters" };
    }

    if (bio && bio.length > 160) {
      return { error: "Bio must not exceed 160 characters" };
    }

    // Check if username is already taken - no changes here
    const existingUser = await executeQuery(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [username, userId]
    );

    if (existingUser.length > 0) {
      return { error: "Username already taken" };
    }

    // Prepare update data
    const updateData = {
      username,
      bio,
    };

    // Get environment
    const isProduction = process.env.NODE_ENV === "production";

    // Process avatar file if uploaded
    const avatarFile = formData.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      // Check file size
      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return { error: "Avatar image must be less than 2MB" };
      }

      try {
        const avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
        const avatarFilename = `avatar-${userId}-${uuidv4()}.webp`;

        // Process the image with sharp
        const processedAvatar = await sharp(avatarBuffer)
          .resize(200, 200, { fit: "cover" })
          .webp({ quality: 80 });

        // Handle based on environment
        if (isProduction) {
          // PRODUCTION: Upload to Vercel Blob
          const { url: avatarUrl } = await put(
            `avatars/${avatarFilename}`,
            await processedAvatar.toBuffer(),
            { access: "public" }
          );

          updateData.avatar = avatarUrl;
        } else {
          // DEVELOPMENT: Save to local filesystem
          const avatarPath = `/uploads/avatars/${avatarFilename}`;
          const fullAvatarPath = join(process.cwd(), "public", avatarPath);

          // Create directory if it doesn't exist
          await mkdir(join(process.cwd(), "public", "uploads", "avatars"), {
            recursive: true,
          });

          // Save the file locally
          await processedAvatar.toFile(fullAvatarPath);

          updateData.avatar = avatarPath;
        }
      } catch (err) {
        console.error("Error processing avatar:", err);
        return { error: "Failed to process avatar image" };
      }
    }

    // Process cover file if uploaded
    const coverFile = formData.get("cover");
    if (coverFile && coverFile.size > 0) {
      // Check file size
      if (coverFile.size > MAX_COVER_SIZE) {
        return { error: "Cover image must be less than 4MB" };
      }

      try {
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        const coverFilename = `cover-${userId}-${uuidv4()}.webp`;

        // Process the image with sharp
        const processedCover = await sharp(coverBuffer)
          .resize(1500, 500, { fit: "cover" })
          .webp({ quality: 80 });

        // Handle based on environment
        if (isProduction) {
          // PRODUCTION: Upload to Vercel Blob
          const { url: coverUrl } = await put(
            `covers/${coverFilename}`,
            await processedCover.toBuffer(),
            { access: "public" }
          );

          updateData.cover = coverUrl;
        } else {
          // DEVELOPMENT: Save to local filesystem
          const coverPath = `/uploads/covers/${coverFilename}`;
          const fullCoverPath = join(process.cwd(), "public", coverPath);

          // Create directory if it doesn't exist
          await mkdir(join(process.cwd(), "public", "uploads", "covers"), {
            recursive: true,
          });

          // Save the file locally
          await processedCover.toFile(fullCoverPath);

          updateData.cover = coverPath;
        }
      } catch (err) {
        console.error("Error processing cover:", err);
        return { error: "Failed to process cover image" };
      }
    }

    // Build the SQL query - no changes here
    const fields = Object.keys(updateData);
    const fieldAssignments = fields.map((field) => `${field} = ?`).join(", ");
    const values = Object.values(updateData);

    // Execute the update - no changes here
    await executeQuery(`UPDATE users SET ${fieldAssignments} WHERE id = ?`, [
      ...values,
      userId,
    ]);

    // Revalidate the profile page - no changes here
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "An unexpected error occurred" };
  }
}

export default async function EditProfilePage() {
  // Get session
  const session = await auth();

  // Redirect if not logged in
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch user data
  const userData = await executeQuery(
    `SELECT id, username, email, avatar, bio, cover FROM users WHERE id = ?`,
    [session.user.id]
  );

  if (!userData || userData.length === 0) {
    redirect("/login");
  }

  const user = userData[0];

  // Handle form submission
  async function handleFormAction(formData) {
    "use server";

    const result = await updateProfile(formData);

    if (result.success) {
      redirect("/profile");
    }

    return result;
  }

  return (
    <div>
      <BackButton />
      <div className="px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your profile information and images
          </p>
        </div>

        {/* Content */}
        <div>
          <form action={handleFormAction} className="space-y-8">
            {/* Profile Images Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Profile Images</h3>
                <p className="text-sm text-gray-500">
                  Customize your avatar and cover photo
                </p>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Photo</Label>
                <div className="relative h-40 overflow-hidden rounded-md bg-accent grid place-content-center">
                  {user?.cover ? (
                    <Image
                      src={user.cover}
                      alt="Cover"
                      className="h-full w-full object-cover"
                      width={1240}
                      height={400}
                    />
                  ) : (
                    <span className="">No photo selected</span>
                  )}
                </div>
                <Input
                  type="file"
                  id="cover"
                  name="cover"
                  accept="image/*"
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  Recommended size: 1240x400px. Max size: 4MB.
                </p>
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    className="w-auto cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Square image recommended. Max size: 2MB.
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Profile Information</h3>
                <p className="text-sm text-gray-500">
                  Update your profile details
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="username"
                  defaultValue={user.username || ""}
                  required
                  minLength={3}
                  maxLength={30}
                />
                <p className="text-sm text-gray-500">
                  This is your public username.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <BioTextarea defaultValue={user.bio || ""} />
              </div>
            </div>

            <Button type="submit" className="cursor-pointer">
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
