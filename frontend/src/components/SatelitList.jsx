import SatelitCard from "./SatelitCard.jsx";

export default function SatelitList({
  sateliti,
  onToggle,
  onDelete,
  onEdit,
  onCompare,
  compareIds = [],
  onToggleWatchlist,
  watchlistIds = [],
  selectedId,
  onSelect,
}) {
  if (!sateliti || sateliti.length === 0) {
    return (
      <p className="empty">Nu există niciun satelit înregistrat pe orbită.</p>
    );
  }

  return (
    <ul className="item-list">
      {sateliti.map((satelit) => (
        <SatelitCard
          key={satelit.id}
          satelit={satelit}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onCompare={onCompare}
          isCompared={compareIds.includes(satelit.id)}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={watchlistIds.includes(satelit.id)}
          isSelected={selectedId === satelit.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}