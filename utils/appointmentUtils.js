// utils/appointmentUtils.js
export const fetchAdminAppointments = async (firestore) => {
  try {
    const appointmentsSnapshot = await getDocs(
      collection(firestore, "appointments")
    );
    return appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    throw error;
  }
};

export const fetchDoctorAppointments = async (firestore, doctorId) => {
  try {
    const appointmentsRef = collection(firestore, "appointments");
    const q = query(appointmentsRef, where("doctorId", "==", doctorId)); // Ensure "doctorId" exists in the document
    const appointmentsSnapshot = await getDocs(q);

    if (appointmentsSnapshot.empty) {
      console.log("No appointments found for this doctor.");
    }

    return appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
};

export const fetchPatientAppointments = async (firestore, patientId) => {
  try {
    const appointmentsRef = collection(firestore, "appointments");
    const q = query(appointmentsRef, where("patientId", "==", patientId));
    const appointmentsSnapshot = await getDocs(q);
    return appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (
  firestore,
  appointmentId,
  status
) => {
  try {
    const appointmentRef = doc(firestore, "appointments", appointmentId);
    await updateDoc(appointmentRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};
