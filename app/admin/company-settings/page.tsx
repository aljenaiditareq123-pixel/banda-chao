import { Metadata } from 'next';
import CompanySettingsClient from './page-client';

export const metadata: Metadata = {
  title: 'Company Settings | Admin Dashboard',
  description: 'Manage company profile and verification documents',
};

export default function CompanySettingsPage() {
  return <CompanySettingsClient />;
}
