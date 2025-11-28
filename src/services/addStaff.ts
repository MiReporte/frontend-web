import { NewStaffBody, NewStaffResponse } from "@/utils/types";

export async function addStaff(
  token: string,
  staffData: NewStaffBody
): Promise<NewStaffResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/create-staff`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add staff");
  }

  const data: NewStaffResponse = await response.json();
  return data;
}
