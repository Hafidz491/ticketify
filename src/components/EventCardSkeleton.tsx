'use client';

import React from 'react';

interface EventCardSkeletonProps {
  count?: number;
}

export function SingleEventCardSkeleton() {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Cover Image Placeholder */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '190px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{ width: '64px', height: '22px', borderRadius: 'var(--radius-pill)' }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: '78px', height: '22px', borderRadius: 'var(--radius-pill)' }}
          />
        </div>
      </div>

      {/* Details Content Placeholder */}
      <div
        style={{
          padding: '1.25rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Title Placeholder */}
          <div
            className="skeleton-shimmer"
            style={{ width: '85%', height: '20px', borderRadius: 'var(--radius-xs)' }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: '55%', height: '16px', borderRadius: 'var(--radius-xs)' }}
          />

          {/* Date & Location Placeholder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
            <div
              className="skeleton-shimmer"
              style={{ width: '70%', height: '14px', borderRadius: 'var(--radius-xs)' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '60%', height: '14px', borderRadius: 'var(--radius-xs)' }}
            />
          </div>
        </div>

        {/* Bottom Price & Button Placeholder */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.95rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '40%' }}>
            <div
              className="skeleton-shimmer"
              style={{ width: '60%', height: '10px', borderRadius: 'var(--radius-xs)' }}
            />
            <div
              className="skeleton-shimmer"
              style={{ width: '100%', height: '18px', borderRadius: 'var(--radius-xs)' }}
            />
          </div>
          <div
            className="skeleton-shimmer"
            style={{ width: '84px', height: '34px', borderRadius: 'var(--radius-pill)' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function EventCardSkeleton({ count = 8 }: EventCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <SingleEventCardSkeleton key={idx} />
      ))}
    </>
  );
}

