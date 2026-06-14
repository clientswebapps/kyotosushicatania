import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUpdateDocument, useDeleteDocument } from "../../hooks/useFirestore";
import { Search, Calendar, Users, Check, X, Trash2 } from "lucide-react";

export default function ReservationsTab({
  reservations,
  resLoading,
  seeding,
  handleSeedDatabase,
}) {
  const [resSearch, setResSearch] = useState("");
  const [resDateFilter, setResDateFilter] = useState("");
  const [resPartyFilter, setResPartyFilter] = useState("");
  const [resStatusTab, setResStatusTab] = useState("pending");
  const [deletingResId, setDeletingResId] = useState(null);

  const { updateDocument: updateRes } = useUpdateDocument("reservations");
  const { deleteDocument: deleteRes } = useDeleteDocument("reservations");

  // Filtered reservations based on search text, date, party size, and status tab
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];

    let list = [...reservations];

    // Sort chronologically by dinner reservation date & time
    list.sort((a, b) => {
      if (a.date !== b.date) {
        return (a.date || "").localeCompare(b.date || "");
      }
      return (a.time || "").localeCompare(b.time || "");
    });

    return list.filter((res) => {
      // 1. Status Tab filter
      if (resStatusTab !== "all" && res.status !== resStatusTab) {
        return false;
      }

      // 2. Search Text filter (matches name, email, phone, or notes)
      if (resSearch.trim()) {
        const query = resSearch.toLowerCase();
        const nameMatch = res.name?.toLowerCase().includes(query);
        const emailMatch = res.email?.toLowerCase().includes(query);
        const phoneMatch = res.phone?.toLowerCase().includes(query);
        const notesMatch = res.notes?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !phoneMatch && !notesMatch) {
          return false;
        }
      }

      // 3. Date filter
      if (resDateFilter) {
        if (res.date !== resDateFilter) {
          return false;
        }
      }

      // 4. Party Size filter
      if (resPartyFilter) {
        if (resPartyFilter === "11") {
          if (Number(res.partySize) <= 10) return false;
        } else {
          if (Number(res.partySize) !== Number(resPartyFilter)) return false;
        }
      }

      return true;
    });
  }, [reservations, resStatusTab, resSearch, resDateFilter, resPartyFilter]);

  const handleResStatus = async (id, status) => {
    try {
      await updateRes(id, { status });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResDelete = async (id) => {
    if (deletingResId === id) {
      try {
        await deleteRes(id);
        setDeletingResId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setDeletingResId(id);
      // Auto-reset delete state after 4 seconds
      setTimeout(() => {
        setDeletingResId((prev) => (prev === id ? null : prev));
      }, 4000);
    }
  };

  return (
    <motion.div
      key="reservations"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="admin-res-header-row">
        <h2>Reservation Requests</h2>

        {/* Database Seeding fallback button if DB is empty */}
        {reservations.length === 0 && !resLoading && (
          <button onClick={handleSeedDatabase} className="btn-seed-db" disabled={seeding}>
            {seeding ? "Seeding..." : "Seed Database"}
          </button>
        )}
      </div>

      {/* Advanced Filter Panel */}
      <div className="admin-res-filters-panel">
        <div className="res-filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={resSearch}
            onChange={(e) => setResSearch(e.target.value)}
          />
          {resSearch && (
            <button className="clear-filter-btn" onClick={() => setResSearch("")}>
              &times;
            </button>
          )}
        </div>

        <div className="res-filter-date">
          <Calendar size={16} />
          <input
            type="date"
            value={resDateFilter}
            onChange={(e) => setResDateFilter(e.target.value)}
          />
          {resDateFilter && (
            <button className="clear-filter-btn" onClick={() => setResDateFilter("")}>
              &times;
            </button>
          )}
        </div>

        <div className="res-filter-party">
          <Users size={16} />
          <select
            value={resPartyFilter}
            onChange={(e) => setResPartyFilter(e.target.value)}
          >
            <option value="">Any Guest Size</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
            <option value="11">10+ guests</option>
          </select>
          {resPartyFilter && (
            <button className="clear-filter-btn" onClick={() => setResPartyFilter("")}>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs for Reservation Statuses */}
      <div className="admin-res-subtabs">
        {[
          { id: "pending", label: "Pending Requests" },
          { id: "confirmed", label: "Confirmed" },
          { id: "cancelled", label: "Cancelled" },
          { id: "all", label: "All Reservations" },
        ].map((tab) => {
          const count = reservations.filter((r) => tab.id === "all" || r.status === tab.id).length;
          return (
            <button
              key={tab.id}
              className={`admin-res-subtab-btn ${resStatusTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setResStatusTab(tab.id);
                setDeletingResId(null);
              }}
            >
              <span>{tab.label}</span>
              <span className="res-badge-count">{count}</span>
            </button>
          );
        })}
      </div>

      {resLoading ? (
        <div className="admin-loading-spinner-wrapper">
          <div className="menu-loading-spinner"></div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <p className="admin-empty-state">No reservations found.</p>
      ) : (
        <div className="admin-table-responsive">
          <table className="admin-res-table">
            <thead>
              <tr>
                <th>Customer / Note</th>
                <th>Contact Details</th>
                <th>Date &amp; Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr key={res.id} className={`admin-res-row status-${res.status}`}>
                  <td>
                    <div className="res-customer-info">
                      <span className="res-customer-name">{res.name}</span>
                      {res.notes && (
                        <span className="res-note-tooltip-trigger" title={res.notes}>
                          📝 Note
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="res-contact-details">
                      <a href={`tel:${res.phone}`} className="res-contact-link">{res.phone}</a>
                      <a href={`mailto:${res.email}`} className="res-contact-link secondary">{res.email}</a>
                    </div>
                  </td>
                  <td>
                    <div className="res-datetime">
                      <span className="res-date">{res.date}</span>
                      <span className="res-time">{res.time}</span>
                    </div>
                  </td>
                  <td>
                    <span className="res-party-badge">{res.partySize} guests</span>
                  </td>
                  <td>
                    <span className={`status-badge ${res.status}`}>
                      {res.status === "pending" && "Pending"}
                      {res.status === "confirmed" && "Confirmed"}
                      {res.status === "cancelled" && "Cancelled"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="admin-res-actions justify-end">
                      {res.status !== "confirmed" && (
                        <button
                          onClick={() => handleResStatus(res.id, "confirmed")}
                          className="admin-res-btn confirm"
                          title="Confirm Reservation"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {res.status !== "cancelled" && (
                        <button
                          onClick={() => handleResStatus(res.id, "cancelled")}
                          className="admin-res-btn cancel"
                          title="Cancel Reservation"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleResDelete(res.id)}
                        className={`admin-res-btn delete ${deletingResId === res.id ? "confirming" : ""}`}
                        title={deletingResId === res.id ? "Confirm Delete" : "Delete Reservation"}
                      >
                        {deletingResId === res.id ? (
                          <span className="delete-confirm-text">Confirm?</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
