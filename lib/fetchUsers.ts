// app/lib/fetchUsers.ts

import { LatestUserProfile } from "@/app/utils/types";
import { firestore } from "@/firebase/server";

export async function fetchLatestUsers(limit: number): Promise<{
  users: LatestUserProfile[];
}> {
  try {
    const snapshot = await firestore
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const users: LatestUserProfile[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        // Adicione outros campos conforme necessário
      });
    });

    return { users };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { users: [] };
  }
}
