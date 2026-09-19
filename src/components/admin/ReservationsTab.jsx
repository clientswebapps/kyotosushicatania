import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useCollection,
  useAddDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "../../hooks/useFirestore";
import {
  Search,
  Calendar,
  Users,
  Check,
  X,
  Trash2,
  CalendarOff,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const [sy, sm, sd] = startDateStr.split("-").map(Number);
  const [ey, em, ed] = endDateStr.split("-").map(Number);
  const current = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  let count = 0;
  while (current <= end && count < 90) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
    count++;
  }
  return dates;
};

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
  const [updatingId, setUpdatingId] = useState(null);

  const { updateDocument: updateRes } = useUpdateDocument("reservations");
  const { deleteDocument: deleteRes } = useDeleteDocument("reservations");

  // Closed / Holiday Dates hooks & state
  const { data: closedDates = [], loading: closuresLoading } = useCollection("closedDates", {
    orderByField: null,
    realtime: true,
  });
  const { addDocument: addClosedDate } = useAddDocument("closedDates");
  const { deleteDocument: deleteClosedDate } = useDeleteDocument("closedDates");

  const [showClosuresModal, setShowClosuresModal] = useState(false);
  const [closureStartDate, setClosureStartDate] = useState("");
  const [closureEndDate, setClosureEndDate] = useState("");
  const [closureReason, setClosureReason] = useState("");
  const [isSavingClosure, setIsSavingClosure] = useState(false);
  const [closureError, setClosureError] = useState("");
  const [deletingClosureId, setDeletingClosureId] = useState(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const sortedClosedDates = useMemo(() => {
    return [...closedDates].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [closedDates]);

  const handleAddClosure = async (e) => {
    e.preventDefault();
    if (!closureStartDate) {
      setClosureError("Please select a date.");
      return;
    }
    setClosureError("");
    setIsSavingClosure(true);

    try {
      let datesToAdd = [closureStartDate];
      if (closureEndDate && closureEndDate >= closureStartDate) {
        datesToAdd = getDatesInRange(closureStartDate, closureEndDate);
      }

      const existingDatesSet = new Set(closedDates.map((c) => c.date));
      const reasonText = closureReason.trim() || "Holiday / Chiusura";

      for (const d of datesToAdd) {
        if (!existingDatesSet.has(d)) {
          await addClosedDate({
            date: d,
            reason: reasonText,
            createdAt: new Date().toISOString(),
          });
        }
      }

      setClosureStartDate("");
      setClosureEndDate("");
      setClosureReason("");
    } catch (err) {
      console.error("Error adding closed dates:", err);
      setClosureError("Failed to save closure. Please try again.");
    } finally {
      setIsSavingClosure(false);
    }
  };

  const handleDeleteClosure = async (id) => {
    if (deletingClosureId === id) {
      try {
        await deleteClosedDate(id);
        setDeletingClosureId(null);
      } catch (err) {
        console.error("Error deleting closed date:", err);
      }
    } else {
      setDeletingClosureId(id);
      setTimeout(() => {
        setDeletingClosureId((prev) => (prev === id ? null : prev));
      }, 4000);
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered reservations based on search text, date, party size, and status tab
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];

    let list = [...reservations];

    // Sort logic:
    // 1. When on "confirmed" tab, show the most recently confirmed first.
    list.sort((a, b) => {
      if (resStatusTab === "confirmed") {
        const timeB = b.confirmedAt || b.updatedAt || b.createdAt || `${b.date || ""} ${b.time || ""}`;
        const timeA = a.confirmedAt || a.updatedAt || a.createdAt || `${a.date || ""} ${a.time || ""}`;
        return timeB.localeCompare(timeA);
      }

      // Default sorting for other tabs (chronologically by reservation date & time)
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

  // Reset to first page whenever search, filter, tab, or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [resStatusTab, resSearch, resDateFilter, resPartyFilter, itemsPerPage]);

  const totalItems = filteredReservations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedReservations = useMemo(() => {
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, startIndex, endIndex]);

  const handleResStatus = async (id, status) => {
    if (updatingId) return;

    // Accidental click prevention dialog
    const actionText = status === "confirmed" ? "CONFIRM (Confermare)" : "CANCEL (Annullare)";
    const confirmMessage = `Are you sure you want to ${actionText} this reservation?\n\nQuesta azione è irreversibile. Sei sicuro?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingId(id);
    try {
      const updateData = { status, updatedAt: new Date().toISOString() };
      if (status === "confirmed") {
        updateData.confirmedAt = new Date().toISOString();
      } else if (status === "cancelled") {
        updateData.cancelledAt = new Date().toISOString();
      }
      await updateRes(id, updateData);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResDelete = async (id) => {
    if (updatingId) return;
    if (deletingResId === id) {
      setUpdatingId(id);
      try {
        await deleteRes(id);
        setDeletingResId(null);
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingId(null);
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
        <div>
          <h2>Reservation Requests</h2>
          <p className="admin-res-subtitle">Manage guest bookings &amp; restaurant holiday closures</p>
        </div>

        <div className="admin-res-header-actions">
          <button
            type="button"
            onClick={() => setShowClosuresModal(true)}
            className="btn-manage-closures"
            title="Manage restaurant holiday and closed dates"
          >
            <CalendarOff size={16} />
            <span>Holiday Closures ({sortedClosedDates.length})</span>
          </button>

          {/* Database Seeding fallback button if DB is empty */}
          {reservations.length === 0 && !resLoading && (
            <button onClick={handleSeedDatabase} className="btn-seed-db" disabled={seeding}>
              {seeding ? "Seeding..." : "Seed Database"}
            </button>
          )}
        </div>
      </div>

      {/* Scheduled Closures Preview Banner */}
      {sortedClosedDates.length > 0 && (
        <div className="admin-closures-banner">
          <div className="closures-banner-left">
            <CalendarOff size={16} className="closures-banner-icon" />
            <span>
              <strong>{sortedClosedDates.length} scheduled closed date{sortedClosedDates.length > 1 ? "s" : ""}:</strong>{" "}
              {sortedClosedDates.slice(0, 3).map((c) => `${c.date} (${c.reason || "Holiday"})`).join(", ")}
              {sortedClosedDates.length > 3 ? "..." : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowClosuresModal(true)}
            className="closures-banner-link"
          >
            Manage Closures &rarr;
          </button>
        </div>
      )}

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
              {paginatedReservations.map((res) => (
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
                    {res.status === "confirmed" && (res.confirmedAt || res.updatedAt) && (
                      <span className="res-confirmed-time">
                        {new Date(res.confirmedAt || res.updatedAt).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="admin-res-actions justify-end">
                      {res.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResStatus(res.id, "confirmed")}
                            className="admin-res-btn confirm"
                            title="Confirm Reservation"
                            disabled={updatingId !== null}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleResStatus(res.id, "cancelled")}
                            className="admin-res-btn cancel"
                            title="Cancel Reservation"
                            disabled={updatingId !== null}
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleResDelete(res.id)}
                        className={`admin-res-btn delete ${deletingResId === res.id ? "confirming" : ""}`}
                        title={deletingResId === res.id ? "Confirm Delete" : "Delete Reservation"}
                        disabled={updatingId !== null}
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

      {/* Pagination Controls */}
      {filteredReservations.length > 0 && (
        <div className="admin-pagination-container">
          <div className="admin-pagination-info">
            Showing <strong>{startIndex + 1}</strong> &ndash; <strong>{endIndex}</strong> of <strong>{totalItems}</strong> reservations
          </div>

          <div className="admin-pagination-controls">
            <div className="admin-per-page-selector">
              <label htmlFor="res-per-page">Per page:</label>
              <select
                id="res-per-page"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination-pages">
                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safeCurrentPage) <= 1
                    );
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push({ type: "ellipsis", key: `ellipsis-${p}` });
                    }
                    acc.push({ type: "page", number: p, key: `page-${p}` });
                    return acc;
                  }, [])
                  .map((item) => {
                    if (item.type === "ellipsis") {
                      return (
                        <span key={item.key} className="pagination-ellipsis">
                          &hellip;
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`pagination-btn page-number ${safeCurrentPage === item.number ? "active" : ""}`}
                        onClick={() => setCurrentPage(item.number)}
                        aria-current={safeCurrentPage === item.number ? "page" : undefined}
                      >
                        {item.number}
                      </button>
                    );
                  })}

                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holiday Closures Management Modal */}
      {showClosuresModal && (
        <div className="admin-modal-overlay" onClick={() => setShowClosuresModal(false)}>
          <div className="admin-modal-container closures-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-group">
                <CalendarOff size={22} className="modal-title-icon" />
                <div>
                  <h3>Holiday &amp; Closed Dates</h3>
                  <p className="modal-subtitle">
                    Dates listed here will be blocked on the website reservation calendar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowClosuresModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="closures-modal-body">
              {/* Add Closure Form */}
              <form onSubmit={handleAddClosure} className="closures-add-form">
                <h4 className="closures-section-heading">Add Closed Date or Vacation Range</h4>
                <div className="closures-form-grid">
                  <div className="closures-form-field">
                    <label htmlFor="closure-start">Date (or Start Date) *</label>
                    <input
                      id="closure-start"
                      type="date"
                      required
                      min={todayStr}
                      value={closureStartDate}
                      onChange={(e) => {
                        setClosureStartDate(e.target.value);
                        if (closureEndDate && closureEndDate < e.target.value) {
                          setClosureEndDate(e.target.value);
                        }
                      }}
                    />
                  </div>

                  <div className="closures-form-field">
                    <label htmlFor="closure-end">End Date (Optional for Range)</label>
                    <input
                      id="closure-end"
                      type="date"
                      min={closureStartDate || todayStr}
                      value={closureEndDate}
                      onChange={(e) => setClosureEndDate(e.target.value)}
                      placeholder="Select for date range"
                    />
                  </div>

                  <div className="closures-form-field reason-field">
                    <label htmlFor="closure-reason">Reason / Holiday Note</label>
                    <input
                      id="closure-reason"
                      type="text"
                      placeholder="e.g. Ferie Estive, Ferragosto, Chiusura Straordinaria"
                      value={closureReason}
                      onChange={(e) => setClosureReason(e.target.value)}
                    />
                  </div>
                </div>

                {closureError && <p className="closures-form-error">{closureError}</p>}

                <div className="closures-form-actions">
                  <button
                    type="submit"
                    className="btn-add-closure"
                    disabled={isSavingClosure}
                  >
                    <Plus size={16} />
                    <span>{isSavingClosure ? "Saving..." : "Block Selected Date(s)"}</span>
                  </button>
                </div>
              </form>

              {/* Blocked Dates List */}
              <div className="closures-list-section">
                <h4 className="closures-section-heading">
                  <span>Scheduled Closures</span>
                  <span className="closures-count-badge">{sortedClosedDates.length}</span>
                </h4>

                {sortedClosedDates.length === 0 ? (
                  <div className="closures-empty-state">
                    <Calendar size={28} />
                    <p>No holiday closures configured. Kyō-To is accepting reservations according to standard operating hours.</p>
                  </div>
                ) : (
                  <div className="closures-items-grid">
                    {sortedClosedDates.map((item) => {
                      const isPast = item.date < todayStr;
                      return (
                        <div key={item.id} className={`closure-item-card ${isPast ? "is-past" : ""}`}>
                          <div className="closure-item-info">
                            <span className="closure-item-date">{item.date}</span>
                            <span className="closure-item-reason">{item.reason || "Holiday"}</span>
                            {isPast && <span className="closure-past-badge">Past</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteClosure(item.id)}
                            className={`admin-res-btn delete ${deletingClosureId === item.id ? "confirming" : ""}`}
                            title={deletingClosureId === item.id ? "Confirm Unblock" : "Remove Block"}
                          >
                            {deletingClosureId === item.id ? (
                              <span className="delete-confirm-text">Confirm?</span>
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setShowClosuresModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
