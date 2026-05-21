import { useState } from 'react';
import { AboutData, ValidationResult } from '../lib/types';

interface AboutSectionProps {
  about: AboutData | null;
  onSave?: (data: AboutData) => ValidationResult;
  isAdmin?: boolean;
}

export function AboutSection({ about, onSave, isAdmin }: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(about?.description ?? '');
  const [socialLinks, setSocialLinks] = useState<{ label: string; url: string }[]>(
    about?.socialLinks ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  function startEditing() {
    setDescription(about?.description ?? '');
    setSocialLinks(about?.socialLinks ?? []);
    setErrors({});
    setSuccessMessage('');
    setIsEditing(true);
  }

  function handleAddLink() {
    setSocialLinks([...socialLinks, { label: '', url: '' }]);
  }

  function handleRemoveLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  }

  function handleLinkChange(index: number, field: 'label' | 'url', value: string) {
    const updated = socialLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setSocialLinks(updated);
  }

  function handleSave() {
    if (!onSave) return;

    setSuccessMessage('');
    const data: AboutData = { description, socialLinks };
    const result = onSave(data);

    if (result.success) {
      setErrors({});
      setSuccessMessage('Zapisano pomyślnie');
      setIsEditing(false);
    } else {
      setErrors(result.errors);
    }
  }

  const inputClasses = "bg-gray-700 border border-gray-600 text-gray-100 rounded p-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  // Empty state for non-admin
  if (!about && !isAdmin) {
    return (
      <section className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2 text-gray-100">O mnie</h2>
        <p className="text-gray-400">Brak treści</p>
      </section>
    );
  }

  // Empty state for admin (not editing)
  if (!about && isAdmin && !isEditing) {
    return (
      <section className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2 text-gray-100">O mnie</h2>
        <p className="text-gray-400">Brak treści</p>
        <button
          onClick={startEditing}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edytuj
        </button>
      </section>
    );
  }

  // Edit mode
  if (isAdmin && isEditing) {
    return (
      <section className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-100">O mnie — edycja</h2>

        {successMessage && (
          <p className="mb-3 text-green-400 font-medium">{successMessage}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-300">Opis</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={5}
            className={`${inputClasses} w-full resize-y`}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/2000</p>
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-300">Linki społecznościowe</label>
          {socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2 items-start">
              <input
                type="text"
                placeholder="Etykieta"
                value={link.label}
                onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                className={`${inputClasses} flex-1`}
              />
              <input
                type="text"
                placeholder="URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                className={`${inputClasses} flex-1`}
              />
              <button
                onClick={() => handleRemoveLink(index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Usuń
              </button>
              {errors[`socialLinks[${index}].url`] && (
                <p className="text-red-400 text-sm">{errors[`socialLinks[${index}].url`]}</p>
              )}
            </div>
          ))}
          {errors.socialLinks && (
            <p className="text-red-400 text-sm mt-1">{errors.socialLinks}</p>
          )}
          <button
            onClick={handleAddLink}
            className="mt-1 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 border border-gray-600"
          >
            Dodaj link
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Zapisz
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
          >
            Anuluj
          </button>
        </div>
      </section>
    );
  }

  // Display mode
  return (
    <section className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-2 text-gray-100">O mnie</h2>

      {successMessage && (
        <p className="mb-3 text-green-400 font-medium">{successMessage}</p>
      )}

      {about && (
        <>
          <p className="mb-4 whitespace-pre-wrap text-gray-300">{about.description}</p>
          {about.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {about.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <button
          onClick={startEditing}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edytuj
        </button>
      )}
    </section>
  );
}
