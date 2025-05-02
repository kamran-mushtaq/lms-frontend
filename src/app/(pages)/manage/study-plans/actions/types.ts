import { StudyPlanSchedule } from "../types";

export type SelectPlanAction = (plan: StudyPlanSchedule) => Promise<void> | void;
export type CancelAction = () => void;
