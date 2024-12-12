import { format } from "date-fns";
import { useState } from "react";

const AppointmentList = ({ appointments = [] }) => {
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Appointments</h2>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Sort {sortOrder === "asc" ? "↓" : "↑"}
        </button>
      </div>

      {sortedAppointments.length === 0 ? (
        <p className="text-gray-500 text-center">No appointments scheduled</p>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-sm p-4 bg-white"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg text-red-600">
                    Dr. {appointment.doctor.name}
                  </h3>
                  <p className="text-gray-600">{appointment.specialty}</p>
                  <p className="text-gray-600">
                    {format(new Date(appointment.date), "PPP")} at{" "}
                    {format(new Date(appointment.date), "p")}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
