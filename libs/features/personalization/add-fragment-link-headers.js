export default async function addFragmentLinkHeaders(fragment, a) {
  const dataTypes = [
    'manifestId',
    'fragmentManifestId',
  ];
  dataTypes.forEach((dataType) => {
    const id = a.dataset[dataType];
    if (id) {
      fragment.setAttribute('daa-lh', id);
      fragment.dataset[dataType] = id;
    }
  });
}
