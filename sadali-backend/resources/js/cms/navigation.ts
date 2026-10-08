import type { RecordData } from './adapter';

export function openPageSelection(
    record: RecordData,
    selectPage: (record: RecordData) => void,
    selectSectionPage: (page: number) => void,
) {
    selectPage(record);
    selectSectionPage(1);
}
