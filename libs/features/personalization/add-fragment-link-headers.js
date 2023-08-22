export default async function addFragmentLinkHeaders(fragment, a) {
  fragment.querySelectorAll(':scope > div > div').forEach((block) => {
    block.dataset.manifestId = a.dataset.manifestId;
    block.dataset.manifestAction = a.dataset.manifestAction;
  });
}
