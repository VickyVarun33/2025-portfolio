import React from 'react';

export default function StairPanel({ data, onClose }) {
  return (
    <div className="stair-panel">
      <button className="close-btn" onClick={onClose}>X</button>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      {data.links && (
        <ul>
          {data.links.map((link, i) => (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
