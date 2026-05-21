import React, { useEffect, useState, useCallback } from 'react'
import { TextInput, Stack } from '@sanity/ui'
import { StringInputProps, useClient, set, unset } from 'sanity'

export function CountryAutocomplete(props: StringInputProps) {
  const { elementProps, value, onChange } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    // Query already-entered country names from the database dynamically
    client
      .fetch(`array::unique(*[_type == "bird" && defined(country)].country)`)
      .then((data: string[]) => {
        const list = (data || []).filter(Boolean).sort()
        setCountries(list)
      })
      .catch(console.error)
  }, [client])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Stack space={2}>
      <TextInput
        {...elementProps}
        value={value || ''}
        onChange={handleChange}
        list="country-suggestions"
        placeholder="Type a new country or select an existing one..."
      />
      <datalist id="country-suggestions">
        {countries.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </Stack>
  )
}
