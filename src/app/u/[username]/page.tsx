import { db } from "@/db";
import { users, profiles, projects, certificates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ProfileClient } from "@/components/features/profile/profile-client";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const [userData] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!userData) {
    notFound();
  }

  const [profileData] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userData.id))
    .limit(1);

  let userProjects: any[] = [];
  let userCertificates: any[] = [];

  try {
    userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.profileId, userData.id));

    userCertificates = await db
      .select()
      .from(certificates)
      .where(eq(certificates.profileId, userData.id));
  } catch (error) {
    console.warn("Database offline. Projects/certificates lookups failed, loading default fallback arrays.", error);
  }

  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === userData.id;

  return (
    <ProfileClient
      user={userData}
      profile={profileData || { userId: userData.id }}
      initialProjects={userProjects}
      initialCertificates={userCertificates}
      isOwnProfile={isOwnProfile}
    />
  );
}
