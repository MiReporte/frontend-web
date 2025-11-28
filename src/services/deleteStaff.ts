export async function deleteStaff(
  token: string,
  userId: number
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/admin/delete-user/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(
    "DELETE RESPONSE:",
    response.status,
    await response.clone().text()
  );

  if (!response.ok) {
    throw new Error("Failed to delete staff member");
  }
}
