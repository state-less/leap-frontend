export const getBreadCrumbs = (pathName, getTitle) => {
  const arr = ['', ...pathName.split('/').filter(Boolean)].map((e) =>
    getTitle(e)
  );
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 !== 0) {
      arr.splice(i, 0, '/');
    }
  }
  return arr;
};
