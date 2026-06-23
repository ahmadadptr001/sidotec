import axios from "axios";

export async function backupDatabase() {
  const response = await axios.get("/api/backup", {
    responseType: "blob",
  });

  if (response.status !== 200) {
    throw new Error("Gagal melakukan backup database");
  }

  return response.data;
}

export async function getBackupStats() {
  const response = await axios.get("/api/backup");

  if (response.data?.status !== 200) {
    throw new Error(
      response.data?.reason || "Gagal mengambil statistik backup",
    );
  }

  return response.data;
}

export async function restoreDatabase(backupData: any) {
  const response = await axios.post("/api/restore", backupData);

  if (response.data?.status !== 200) {
    throw new Error(
      response.data?.reason || "Gagal melakukan restore database",
    );
  }

  return response.data;
}
