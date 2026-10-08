import type { Field } from './config';

export function serializeFields(
    fields: Field[],
    values: Record<string, string | boolean>,
    demo: boolean,
): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const field of fields) {
        const raw = values[field.key];
        if (field.type === 'password' && (demo || !raw)) continue;
        const value =
            field.type === 'checkbox'
                ? Boolean(raw)
                : field.type === 'number' || field.key === 'page_id'
                  ? raw === ''
                      ? null
                      : Number(raw)
                  : raw === ''
                    ? null
                    : raw;
        const [parent, child] = field.key.split('.');
        if (child) {
            // limit is optional, but unlike text config fields is not nullable.
            if (field.key === 'config.limit' && value == null) continue;
            const nested = (body[parent] ?? {}) as Record<string, unknown>;
            nested[child] = value;
            body[parent] = nested;
        } else body[field.key] = value;
    }
    return body;
}
