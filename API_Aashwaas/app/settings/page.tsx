"use client";

import React from 'react';
import Button from '../../components/common/Button';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2">Notification preferences and account settings go here.</p>
        <div className="mt-4">
          <Button>Save</Button>
        </div>
      </div>
    </div>
  );
}
