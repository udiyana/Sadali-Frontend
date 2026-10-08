import AcalaCms, { type DriverProps } from './AcalaCms';
import { driverFor } from './schema';
// Explicit code registry. Server metadata never selects URLs, imports or executable code.
const registry = { acala: AcalaCms };
export function resolveDriver(props: DriverProps) {
    const key = driverFor(props.cmsBrand?.cms_driver, props.demo);
    return key === 'generic' ? undefined : key === null ? null : registry[key];
}
