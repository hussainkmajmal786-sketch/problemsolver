import './Skeleton.css';

export function SkeletonLine({ width = '100%', height = '14px', style }) {
  return <div className="skeleton-line" style={{ width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card glass-card">
      <div className="skeleton-card-header">
        <SkeletonLine width="80px" height="22px" />
        <SkeletonLine width="60px" height="22px" />
      </div>
      <SkeletonLine width="85%" height="20px" style={{ marginTop: 16 }} />
      <SkeletonLine width="60%" height="20px" style={{ marginTop: 8 }} />
      <SkeletonLine width="100%" height="14px" style={{ marginTop: 16 }} />
      <SkeletonLine width="90%" height="14px" style={{ marginTop: 6 }} />
      <div className="skeleton-card-footer">
        <div className="skeleton-avatar" />
        <SkeletonLine width="100px" height="14px" />
        <SkeletonLine width="60px" height="14px" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="skeleton-detail">
      <SkeletonLine width="60%" height="32px" />
      <SkeletonLine width="40%" height="16px" style={{ marginTop: 12 }} />
      <div style={{ marginTop: 24 }}>
        <SkeletonLine width="100%" height="14px" />
        <SkeletonLine width="95%" height="14px" style={{ marginTop: 8 }} />
        <SkeletonLine width="100%" height="14px" style={{ marginTop: 8 }} />
        <SkeletonLine width="80%" height="14px" style={{ marginTop: 8 }} />
        <SkeletonLine width="90%" height="14px" style={{ marginTop: 8 }} />
        <SkeletonLine width="70%" height="14px" style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonLeaderRow() {
  return (
    <div className="skeleton-leader-row">
      <SkeletonLine width="30px" height="20px" />
      <div className="skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="140px" height="16px" />
        <SkeletonLine width="80px" height="12px" style={{ marginTop: 4 }} />
      </div>
      <SkeletonLine width="60px" height="20px" />
    </div>
  );
}
