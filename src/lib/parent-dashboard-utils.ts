// Color mapping for subject cards
export const subjectColors = {
  Mathematics: "bg-blue-500",
  Science: "bg-purple-500",
  English: "bg-pink-500",
  "Social Studies": "bg-orange-500",
  default: "bg-slate-500",
};

// Get color for subject
export const getSubjectColor = (subjectName: string) => {
  return (
    subjectColors[subjectName as keyof typeof subjectColors] ||
    subjectColors.default
  );
};

// Color mapping for progress status
export const progressStatusColors = {
  on_track: "bg-green-500",
  needs_attention: "bg-yellow-500",
  falling_behind: "bg-red-500",
  default: "bg-slate-500",
};

// Get color for progress status
export const getProgressStatusColor = (status: string) => {
  return (
    progressStatusColors[status as keyof typeof progressStatusColors] ||
    progressStatusColors.default
  );
};

// Format status text
export const formatStatusText = (status: string) => {
  switch (status) {
    case "on_track":
      return "On Track";
    case "needs_attention":
      return "Needs Attention";
    case "falling_behind":
      return "Falling Behind";
    default:
      return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
};

// Get status based on progress percentage
export const getStatusFromProgress = (progress: number) => {
  if (progress >= 80) {
    return "on_track";
  } else if (progress >= 60) {
    return "needs_attention";
  } else {
    return "falling_behind";
  }
};

// Format date for display
export const formatActivityDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
};
