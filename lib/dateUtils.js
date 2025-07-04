// lib/dateUtils.js
export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  // Time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (seconds < 30) {
    return "just now";
  } else if (seconds < minute) {
    return `${seconds} seconds ago`;
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(seconds / year);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}
