export const searchSkills = async (search) => {
  const params = new URLSearchParams({ q: search });
  const response = await fetch(
    `https://ra-13-task-1-server.herokuapp.com/api/search?${params}`
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
};
