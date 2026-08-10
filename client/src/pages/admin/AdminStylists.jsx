import CrudPage from './CrudPage.jsx';

export default function AdminStylists() {
  return (
    <CrudPage
      title="Team Members"
      endpoint="stylists"
      fields={{
        image: { type: 'hidden' },
        role: { type: 'text', label: 'Role' },
        avatar: { type: 'image', label: 'Avatar' },
        cover: { type: 'image', label: 'Cover' },
        bio: { type: 'textarea', label: 'Bio' },
        specializations: { type: 'textarea', label: 'Specializations (comma separated)' },
        experienceYears: { type: 'number', label: 'Experience (years)' },
        instagram: { type: 'text', label: 'Instagram' },
        facebook: { type: 'text', label: 'Facebook' },
        bookable: { type: 'checkbox', label: 'Bookable', default: true },
      }}
      transform={(item) => ({
        ...item,
        specializations: Array.isArray(item.specializations) ? item.specializations.join(', ') : item.specializations || '',
      })}
      reverseTransform={(data) => ({
        ...data,
        specializations: typeof data.specializations === 'string' 
          ? data.specializations.split(',').map(s => s.trim()).filter(Boolean)
          : data.specializations || [],
      })}
      emptyMessage="No team members yet."

    />
  );
}
