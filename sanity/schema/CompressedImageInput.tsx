/**
 * CompressedImageInput
 * ─────────────────────────────────────────────────────────────────────────────
 * A drop-in replacement for Sanity's default image input that silently
 * compresses every photo in the browser before it is uploaded to Sanity.
 *
 * Your father's workflow is unchanged — he just picks a photo as normal.
 * Under the hood:
 *   1. The file is intercepted before upload
 *   2. browser-image-compression reduces size/dimensions
 *   3. The compressed file is handed to Sanity's normal upload pipeline
 *
 * All compression settings live in sanity/lib/imageCompression.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client'

import React, { useCallback, useRef, useState } from 'react'
import { ObjectInputProps, useClient, set, PatchEvent, setIfMissing, useFormValue } from 'sanity'
import { Box, Button, Card, Flex, Spinner, Stack, Text, Badge, useToast } from '@sanity/ui'
import { UploadIcon, CheckmarkIcon, ErrorOutlineIcon } from '@sanity/icons'
import imageCompression from 'browser-image-compression'
import { IMAGE_COMPRESSION_OPTIONS } from '../lib/imageCompression'

// ── Types ────────────────────────────────────────────────────────────────────

type CompressionStatus = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ── Component ────────────────────────────────────────────────────────────────

export function CompressedImageInput(props: ObjectInputProps) {
  const { onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<CompressionStatus>('idle')
  const [stats, setStats] = useState<{
    originalSize: number
    compressedSize: number
    reductionPct: number
  } | null>(null)

  // ── Core upload handler ───────────────────────────────────────────────────

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Reset stats from a previous upload
      setStats(null)

      const originalSize = file.size

      try {
        // 1. Compress ────────────────────────────────────────────────────────
        setStatus('compressing')
        toast.push({
          status: 'info',
          title: 'Compressing image…',
          description: `Original: ${formatBytes(originalSize)}`,
          duration: 8000,
        })

        const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)

        const compressedSize = compressedFile.size
        const reductionPct = Math.round((1 - compressedSize / originalSize) * 100)
        setStats({ originalSize, compressedSize, reductionPct })

        // 2. Upload to Sanity ─────────────────────────────────────────────────
        setStatus('uploading')

        // Give the compressed blob a sensible filename (force .jpg extension)
        const outputName = file.name.replace(/\.[^.]+$/, '.jpg')
        const uploadFile = new File([compressedFile], outputName, {
          type: IMAGE_COMPRESSION_OPTIONS.fileType,
        })

        const asset = await client.assets.upload('image', uploadFile, {
          filename: outputName,
        })

        // 3. Patch the Sanity document field ──────────────────────────────────
        onChange(
          PatchEvent.from([
            setIfMissing({ _type: 'image' }),
            set(
              {
                _type: 'reference',
                _ref: asset._id,
              },
              ['asset']
            ),
          ])
        )

        setStatus('done')
        toast.push({
          status: 'success',
          title: 'Image uploaded!',
          description: `${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (−${reductionPct}% smaller)`,
          duration: 6000,
        })
      } catch (err) {
        console.error('[CompressedImageInput] Error:', err)
        setStatus('error')
        toast.push({
          status: 'error',
          title: 'Compression failed — trying original file…',
          duration: 5000,
        })

        // Fallback: upload the original file unmodified
        try {
          const asset = await client.assets.upload('image', file, { filename: file.name })
          onChange(
            PatchEvent.from([
              setIfMissing({ _type: 'image' }),
              set({ _type: 'reference', _ref: asset._id }, ['asset']),
            ])
          )
          setStatus('done')
          toast.push({
            status: 'warning',
            title: 'Original uploaded (no compression)',
            duration: 5000,
          })
        } catch (fallbackErr) {
          console.error('[CompressedImageInput] Fallback upload failed:', fallbackErr)
          toast.push({
            status: 'error',
            title: 'Upload failed',
            description: 'Please try again.',
            duration: 8000,
          })
        }
      } finally {
        // Reset the file input so the same file can be re-selected if needed
        if (fileInputRef.current) fileInputRef.current.value = ''
        setTimeout(() => setStatus('idle'), 3000)
      }
    },
    [client, onChange, toast]
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack space={3}>
      {/* The default Sanity image input (shows preview, hotspot picker, etc.) */}
      {renderDefault(props)}

      {/* Custom compressed-upload button */}
      <Card
        padding={3}
        radius={2}
        tone={status === 'error' ? 'critical' : status === 'done' ? 'positive' : 'default'}
        border
      >
        <Stack space={3}>
          <Flex align="center" gap={3} wrap="wrap">
            <Box flex={1}>
              <Text size={1} weight="semibold">
                📷 Upload with auto-compression
              </Text>
              <Box marginTop={1}>
                <Text size={1} muted>
                  Max {IMAGE_COMPRESSION_OPTIONS.maxWidthOrHeight}px ·{' '}
                  {IMAGE_COMPRESSION_OPTIONS.initialQuality * 100}% quality ·{' '}
                  {'<'}{IMAGE_COMPRESSION_OPTIONS.maxSizeMB} MB ·{' '}
                  PNG / JPG / TIFF
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text size={0} muted>
                  ⓘ TIFF files are converted to JPEG on upload
                </Text>
              </Box>
            </Box>

            {/* Status badge */}
            {status === 'compressing' && (
              <Flex align="center" gap={2}>
                <Spinner muted />
                <Text size={1} muted>Compressing…</Text>
              </Flex>
            )}
            {status === 'uploading' && (
              <Flex align="center" gap={2}>
                <Spinner muted />
                <Text size={1} muted>Uploading…</Text>
              </Flex>
            )}
            {status === 'done' && (
              <Badge tone="positive" mode="outline">
                ✓ Done
              </Badge>
            )}
            {status === 'error' && (
              <Badge tone="critical" mode="outline">
                ✗ Error
              </Badge>
            )}
          </Flex>

          {/* Compression stats after upload */}
          {stats && (
            <Card padding={2} radius={2} tone="positive">
              <Text size={1}>
                🗜️ Reduced:{' '}
                <strong>{formatBytes(stats.originalSize)}</strong>
                {' → '}
                <strong>{formatBytes(stats.compressedSize)}</strong>
                {' '}
                <Badge tone="positive" fontSize={0}>−{stats.reductionPct}%</Badge>
              </Text>
            </Card>
          )}

          {/* Hidden file input triggered by the button below */}
          {/* Accept only PNG, JPEG/JPG, and TIFF — TIFF is converted to JPEG */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/tiff,.png,.jpg,.jpeg,.tif,.tiff"
            style={{ display: 'none' }}
            id="compressed-image-upload"
            onChange={handleFileChange}
            disabled={status === 'compressing' || status === 'uploading'}
          />

          <Button
            as="label"
            htmlFor="compressed-image-upload"
            text={
              status === 'compressing'
                ? 'Compressing…'
                : status === 'uploading'
                ? 'Uploading…'
                : 'Choose photo to compress & upload'
            }
            icon={status === 'done' ? CheckmarkIcon : UploadIcon}
            tone={status === 'done' ? 'positive' : 'primary'}
            mode="ghost"
            disabled={status === 'compressing' || status === 'uploading'}
          />
        </Stack>
      </Card>
    </Stack>
  )
}
