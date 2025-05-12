import { useEffect, useState } from "react";
import eventGroupService from "../../services/api-services/event-group.service";
import eventService from "../../services/api-services/event.service";
import { EventResponse, EventGroupResponse } from "../../types/event.types";
import { toast } from "react-toastify";
import EventModal from "../../components/ui/modals/event-modal";
import Layout from "../../components/layout";

type TabType = "events" | "event-groups";

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [eventGroups, setEventGroups] = useState<EventGroupResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  );
  const [editingEventGroup, setEditingEventGroup] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [newEventGroup, setNewEventGroup] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchEventData = async (): Promise<void> => {
    try {
      const eventGroupsRes = await eventGroupService.getAllEventGroups();
      setEventGroups(eventGroupsRes.data);

      const eventsRes = await eventService.getAllEvents();
      setEvents(eventsRes.data);
    } catch {
      toast.error("Failed to fetch event data");
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const handleAddEventGroup = async (): Promise<void> => {
    if (!newEventGroup) {
      toast.error("Event group name is required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await eventGroupService.createEventGroup({
        groupName: newEventGroup,
      });
      toast.success(res.message);
      setNewEventGroup("");
      fetchEventData();
    } catch {
      toast.error("Failed to create event group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEventGroup = async (): Promise<void> => {
    if (!editingEventGroup) return;

    try {
      const res = await eventGroupService.updateEventGroup(
        editingEventGroup.id,
        {
          groupName: editingEventGroup.name,
        }
      );
      toast.success(res.message);
      setEditingEventGroup(null);
      fetchEventData();
    } catch {
      toast.error("Failed to update event group");
    }
  };

  const startEditingEventGroup = (group: EventGroupResponse): void => {
    setEditingEventGroup({
      id: group.id,
      name: group.groupName,
    });
  };

  const cancelEditingEventGroup = (): void => {
    setEditingEventGroup(null);
  };

  const handleOpenEventModal = (): void => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = (): void => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleViewEvent = (event: EventResponse): void => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const changeTab = (tab: TabType): void => {
    setActiveTab(tab);
  };

  return (
    <Layout showSideBar={false}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Events Management</h1>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "events" ? "active" : ""}`}
              onClick={() => changeTab("events")}
            >
              Events
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "event-groups" ? "active" : ""
              }`}
              onClick={() => changeTab("event-groups")}
            >
              Event Groups
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {/* Events Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "events" ? "show active" : ""
            }`}
          >
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h4 mb-1">Events</h2>
                  <p className="text-muted small mb-0">Manage all events</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenEventModal}
                >
                  Add Event
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Event Name</th>
                        <th scope="col">Date</th>
                        <th scope="col" className="text-end">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.length > 0 ? (
                        events.map((event) => (
                          <tr key={event.id}>
                            <td>{event.eventName}</td>
                            <td>{new Date(event.date).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleViewEvent(event)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-3">
                            No events found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Event Groups Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "event-groups" ? "show active" : ""
            }`}
          >
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h2 className="h4 mb-1">Event Groups</h2>
                <p className="text-muted small mb-0">
                  Manage event categories and groupings
                </p>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newEventGroup}
                      onChange={(e) => setNewEventGroup(e.target.value)}
                      placeholder="New Event Group"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleAddEventGroup}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Loading...
                        </>
                      ) : (
                        "Add Event Group"
                      )}
                    </button>
                  </div>
                </div>

                {editingEventGroup && (
                  <div className="alert alert-light border mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={editingEventGroup.name}
                        onChange={(e) =>
                          setEditingEventGroup({
                            ...editingEventGroup,
                            name: e.target.value,
                          })
                        }
                      />
                      <button
                        className="btn btn-success"
                        onClick={handleUpdateEventGroup}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={cancelEditingEventGroup}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Event Group Name</th>
                        <th scope="col" className="text-end">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventGroups.length > 0 ? (
                        eventGroups.map((group) => (
                          <tr key={group.id}>
                            <td>{group.groupName}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => startEditingEventGroup(group)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-3">
                            No event groups found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          initialData={selectedEvent}
        />
      )}
    </Layout>
  );
};

export default EventsPage;
