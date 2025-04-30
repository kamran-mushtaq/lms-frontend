"use client";

import { useState, useMemo } from "react";
import { Calendar, momentLocalizer, Views, SlotInfo } from "react-big-calendar";
import moment from "moment";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { StudyPlanSchedule, StudySession, Subject, TimeSlot } from "../types";

// Initialize localizer
const localizer = momentLocalizer(moment);

// Define calendar event type
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        type: "timeSlot" | "session";
        data: TimeSlot | StudySession;
        subject?: Subject;
        isCompleted?: boolean;
    };
}

interface CalendarViewProps {
    studyPlans: StudyPlanSchedule[];
    sessions: StudySession[];
    subjects: Subject[];
    onEditPlan: (plan: StudyPlanSchedule) => void;
    onEditSession: (session: StudySession) => void;
    onCreateSession: (slotInfo: SlotInfo) => void;
}

export function CalendarView({
    studyPlans,
    sessions,
    subjects,
    onEditPlan,
    onEditSession,
    onCreateSession,
}: CalendarViewProps) {
    const [view, setView] = useState<string>(Views.WEEK);
    const [date, setDate] = useState<Date>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Convert time slots from weekly schedule to calendar events
    const scheduleEvents = useMemo<CalendarEvent[]>(() => {
        const events: CalendarEvent[] = [];
        // Find active study plans
        const activePlans = studyPlans.filter(plan => plan.isActive);

        // Current week start date
        const currentWeekStart = moment(date).startOf('week').toDate();

        // Process each plan
        activePlans.forEach(plan => {
            // For each time slot in the plan
            plan.weeklySchedule.forEach(slot => {
                if (!slot.isActive) return;

                // Get subject for this slot
                const subject = subjects.find(s => s.id === slot.subjectId);

                // Parse slot times
                const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                const [endHour, endMinute] = slot.endTime.split(':').map(Number);

                // Create event for this time slot
                // Calculate day offset based on the day of week (0=Sunday, 1=Monday, etc.)
                const slotDate = moment(currentWeekStart).add(slot.dayOfWeek, 'days');

                // Set start and end times for this slot
                const start = moment(slotDate)
                    .hours(startHour)
                    .minutes(startMinute)
                    .seconds(0)
                    .toDate();

                const end = moment(slotDate)
                    .hours(endHour)
                    .minutes(endMinute)
                    .seconds(0)
                    .toDate();

                events.push({
                    id: `slot-${plan.id}-${slot.dayOfWeek}-${slot.startTime}`,
                    title: subject ? `📚 ${subject.displayName}` : 'Scheduled Study Time',
                    start,
                    end,
                    resource: {
                        type: 'timeSlot',
                        data: slot,
                        subject
                    }
                });
            });
        });

        return events;
    }, [studyPlans, subjects, date]);

    // Convert study sessions to calendar events
    const sessionEvents = useMemo<CalendarEvent[]>(() => {
        return sessions.map(session => {
            // Get subject for this session
            const subject = subjects.find(s => s.id === session.subjectId);

            return {
                id: `session-${session.id}`,
                title: subject
                    ? `✓ ${subject.displayName}${session.isCompleted ? ' (Completed)' : ' (In Progress)'}`
                    : `Study Session${session.isCompleted ? ' (Completed)' : ' (In Progress)'}`,
                start: new Date(session.startTime),
                end: session.endTime ? new Date(session.endTime) : new Date(session.startTime),
                resource: {
                    type: 'session',
                    data: session,
                    subject,
                    isCompleted: session.isCompleted
                }
            };
        });
    }, [sessions, subjects]);

    // Combine all events
    const allEvents = useMemo(() => [...scheduleEvents, ...sessionEvents], [scheduleEvents, sessionEvents]);

    // Event styling
    const eventStyleGetter = (event: CalendarEvent) => {
        const isSession = event.resource.type === 'session';
        const isCompleted = isSession && event.resource.isCompleted;

        let backgroundColor = '#4f46e5'; // Default indigo color for schedule slots

        if (isSession) {
            backgroundColor = isCompleted ? '#10b981' : '#f59e0b'; // Green for completed, amber for in-progress
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0',
                display: 'block'
            }
        };
    };

    // Handle event selection
    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
    };

    // Handle selecting a time slot for new session
    const handleSelectSlot = (slotInfo: SlotInfo) => {
        onCreateSession(slotInfo);
    };

    // Close event details dialog
    const handleCloseEventDialog = () => {
        setSelectedEvent(null);
    };

    // Handle editing event
    const handleEditEvent = () => {
        if (!selectedEvent) return;

        if (selectedEvent.resource.type === 'timeSlot') {
            // Find the study plan this time slot belongs to
            const planWithSlot = studyPlans.find(plan =>
                plan.weeklySchedule.some(slot =>
                    slot.dayOfWeek === (selectedEvent.resource.data as TimeSlot).dayOfWeek &&
                    slot.startTime === (selectedEvent.resource.data as TimeSlot).startTime &&
                    slot.endTime === (selectedEvent.resource.data as TimeSlot).endTime
                )
            );

            if (planWithSlot) {
                onEditPlan(planWithSlot);
            }
        } else if (selectedEvent.resource.type === 'session') {
            onEditSession(selectedEvent.resource.data as StudySession);
        }

        setSelectedEvent(null);
    };

    // Format date header in month view
    const formats = {
        dateFormat: 'DD',
        dayFormat: 'ddd DD/MM',
        monthHeaderFormat: 'MMMM YYYY',
        weekdayFormat: 'dddd',
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle>Study Schedule Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select
                            defaultValue={view}
                            onValueChange={(value) => setView(value)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select view" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={Views.DAY}>Day</SelectItem>
                                <SelectItem value={Views.WEEK}>Week</SelectItem>
                                <SelectItem value={Views.MONTH}>Month</SelectItem>
                                <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => setDate(new Date())}>
                            Today
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[600px]">
                    <Calendar
                        localizer={localizer}
                        events={allEvents}
                        startAccessor="start"
                        endAccessor="end"
                        view={view as any}
                        onView={(newView) => setView(newView)}
                        date={date}
                        onNavigate={setDate}
                        selectable
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        eventPropGetter={eventStyleGetter}
                        formats={formats}
                        popup
                        showMultiDayTimes
                    />
                </div>
            </CardContent>

            {/* Event Details Dialog */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && handleCloseEventDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedEvent?.resource.type === 'timeSlot' ? 'Scheduled Study Time' : 'Study Session'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.resource.subject?.displayName || 'Subject information not available'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="font-medium">Start:</div>
                            <div className="col-span-3">
                                {selectedEvent && format(selectedEvent.start, 'PPPP p')}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="font-medium">End:</div>
                            <div className="col-span-3">
                                {selectedEvent && format(selectedEvent.end, 'PPPP p')}
                            </div>
                        </div>

                        {selectedEvent?.resource.type === 'session' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <div className="font-medium">Status:</div>
                                    <div className="col-span-3">
                                        {selectedEvent.resource.isCompleted ? 'Completed' : 'In Progress'}
                                    </div>
                                </div>

                                {(selectedEvent.resource.data as StudySession).notes && (
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <div className="font-medium">Notes:</div>
                                        <div className="col-span-3">
                                            {(selectedEvent.resource.data as StudySession).notes}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleEditEvent}>
                            {selectedEvent?.resource.type === 'timeSlot' ? 'Edit Schedule' : 'Edit Session'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}