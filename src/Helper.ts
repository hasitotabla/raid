export enum RaidType {
    RAID0,
    RAID1,
    RAID1E,
    RAID5,
    RAID50,
    RAID5E,
    RAID5EE,
    RAID10,
    RAID6,
    RAID60,

    RAIDZ1,
    RAIDZ2,
    RAIDZ3,
}

export type RaidHelperResult =
    | {
          success: true;
          data: {
              capacity: number;
              speed: string;
              faultTolerance: number;
              extraDetails?: string;
          };
      }
    | { success: false; error: string };

export type AdditionalFields = Record<string, string>;

export type RaidHelper = {
    label: string;
    hidden?: {
        disks?: boolean;
    };
    additionalFields?: AdditionalFields;
    calculate(
        disks: number,
        capacity: number,
        additionalFields?: AdditionalFields
    ): RaidHelperResult;
};

export const raidHelpers: Record<RaidType, RaidHelper> = {
    [RaidType.RAID0]: {
        label: "RAID 0",
        calculate(disks, capacity) {
            return {
                success: true,
                data: {
                    capacity: disks * capacity,
                    speed: `${disks}x read and write speed gain`,
                    faultTolerance: 0,
                    extraDetails:
                        "No fault tolerance. Data is striped across all disks.",
                },
            };
        },
    },
    [RaidType.RAID1]: {
        label: "RAID 1",
        calculate(disks, capacity) {
            if (disks < 2) {
                return {
                    success: false,
                    error: "RAID1 should be exactly two drives.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: capacity,
                    speed: `${disks}x read speed, no write speed gain`,
                    faultTolerance: disks - 1,
                    extraDetails:
                        "Data is mirrored across all disks. Fault tolerance equals the number of mirrored copies.",
                },
            };
        },
    },
    [RaidType.RAID1E]: {
        label: "RAID 1E",
        calculate(disks, capacity) {
            if (disks % 2 === 0) {
                return {
                    success: false,
                    error: "RAID 1E requires an odd number of drives.",
                };
            }

            if (disks < 3) {
                return {
                    success: false,
                    error: "RAID 1E requires at least 3 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: Math.floor(disks / 2) * capacity,
                    speed: `${disks}x read speed, no write speed gain`,
                    faultTolerance: Math.floor(disks / 2),
                    extraDetails:
                        "Data is mirrored and striped. Fault tolerance depends on the mirroring structure.",
                },
            };
        },
    },
    [RaidType.RAID5]: {
        label: "RAID 5",
        calculate(disks, capacity) {
            if (disks < 3) {
                return {
                    success: false,
                    error: "RAID 5 requires at least 3 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (disks - 1) * capacity,
                    speed: `${disks - 1}x read speed, no write speed gain`,
                    faultTolerance: 1,
                    extraDetails:
                        "Data is striped with a single parity disk. Fault tolerance is 1 disk failure.",
                },
            };
        },
    },
    [RaidType.RAID50]: {
        label: "RAID 50",
        additionalFields: {
            parityRaidCount: "Number of RAID 5 groups",
        },
        calculate(disks, capacity, fields) {
            if (disks < 6) {
                return {
                    success: false,
                    error: "RAID 50 requires at least 6 disks.",
                };
            }

            const parityRaidCount = parseInt(fields?.parityRaidCount || "0");
            if (parityRaidCount < 1) {
                return {
                    success: false,
                    error: "Parity RAIDs count must be at least 1.",
                };
            }

            if (disks % parityRaidCount !== 0) {
                return {
                    success: false,
                    error: "Disks must divide evenly across RAID 5 groups.",
                };
            }

            const groupSize = Math.floor(disks / parityRaidCount);
            if (groupSize < 3) {
                return {
                    success: false,
                    error: "Each RAID 5 group must have at least 3 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: parityRaidCount * (groupSize - 1) * capacity,
                    speed: `${groupSize - 1}x read speed, no write speed gain`,
                    faultTolerance: parityRaidCount,
                    extraDetails: "Nested RAID with multiple RAID 5 groups.",
                },
            };
        },
    },
    [RaidType.RAID5E]: {
        label: "RAID 5E",
        calculate(disks, capacity) {
            if (disks < 4) {
                return {
                    success: false,
                    error: "RAID 5E requires at least 4 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (disks - 1) * capacity,
                    speed: `${disks - 1}x read speed, no write speed gain`,
                    faultTolerance: 1,
                    extraDetails:
                        "Includes a hot spare disk for faster recovery.",
                },
            };
        },
    },
    [RaidType.RAID5EE]: {
        label: "RAID 5EE",
        calculate(disks, capacity) {
            if (disks < 5) {
                return {
                    success: false,
                    error: "RAID 5EE requires at least 5 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (disks - 2) * capacity,
                    speed: `${disks - 2}x read speed, no write speed gain`,
                    faultTolerance: 2,
                    extraDetails:
                        "Includes distributed hot spares for higher availability.",
                },
            };
        },
    },
    [RaidType.RAID10]: {
        label: "RAID 10",
        calculate(disks, capacity) {
            if (disks < 4 || disks % 2 !== 0) {
                return {
                    success: false,
                    error: "RAID 10 requires at least 4 disks and an even number of disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (disks / 2) * capacity,
                    speed: `${disks / 2}x read speed, no write speed gain`,
                    faultTolerance: disks / 2,
                    extraDetails:
                        "Data is mirrored and striped. Fault tolerance is based on the mirroring setup.",
                },
            };
        },
    },
    [RaidType.RAID6]: {
        label: "RAID 6",
        calculate(disks, capacity) {
            if (disks < 4) {
                return {
                    success: false,
                    error: "RAID 6 requires at least 4 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (disks - 2) * capacity,
                    speed: `${disks - 2}x read speed, no write speed gain`,
                    faultTolerance: 2,
                    extraDetails:
                        "Data is striped with dual parity, allowing 2 disk failures.",
                },
            };
        },
    },
    [RaidType.RAID60]: {
        label: "RAID 60",
        additionalFields: {
            parityRaidCount: "Number of RAID 6 groups",
        },
        calculate(disks, capacity, fields) {
            if (disks < 8) {
                return {
                    success: false,
                    error: "RAID 60 requires at least 8 disks.",
                };
            }

            const parityRaidCount = parseInt(fields?.parityRaidCount ?? "0");
            if (parityRaidCount < 2) {
                return {
                    success: false,
                    error: "Parity RAIDs count must be at least 2.",
                };
            }

            const groupSize = Math.floor(disks / parityRaidCount);
            if (groupSize < 4) {
                return {
                    success: false,
                    error: "Each RAID 6 group must have at least 4 disks.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: parityRaidCount * (groupSize - 2) * capacity,
                    speed: `${groupSize - 2}x read speed, no write speed gain`,
                    faultTolerance: parityRaidCount * 2,
                    extraDetails: "Nested RAID with multiple RAID 6 groups.",
                },
            };
        },
    },
    [RaidType.RAIDZ1]: {
        label: "RAIDz1 (Single parity)",
        hidden: { disks: true },
        additionalFields: {
            numOfDriveGroups: "Number of groups",
            numDrivesPerGroup: "Drives per group",
        },
        calculate(disks, capacity, fields) {
            const numOfGroups = parseInt(fields?.numOfDriveGroups || "0");
            if (isNaN(numOfGroups)) {
                return {
                    success: false,
                    error: "Number of groups must be a valid number.",
                };
            }

            if (numOfGroups < 1) {
                return {
                    success: false,
                    error: "Number of groups must be at least 1.",
                };
            }

            const numDrivesPerGroup = parseInt(
                fields?.numDrivesPerGroup || "0"
            );
            if (isNaN(numDrivesPerGroup)) {
                return {
                    success: false,
                    error: "Drives per group must be a valid number.",
                };
            }

            if (numDrivesPerGroup < 2) {
                return {
                    success: false,
                    error: "Drives per group must be at least 2.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (numDrivesPerGroup - 1) * numOfGroups * capacity,
                    speed: `${numOfGroups}x read/write`,
                    faultTolerance: 1,
                },
            };
        },
    },
    [RaidType.RAIDZ2]: {
        label: "RAIDz2 (Double parity)",
        hidden: { disks: true },
        additionalFields: {
            numOfDriveGroups: "Number of groups",
            numDrivesPerGroup: "Drives per group",
        },
        calculate(disks, capacity, fields) {
            const numOfGroups = parseInt(fields?.numOfDriveGroups || "0");
            if (isNaN(numOfGroups)) {
                return {
                    success: false,
                    error: "Number of groups must be a valid number.",
                };
            }

            if (numOfGroups < 1) {
                return {
                    success: false,
                    error: "Number of groups must be at least 1.",
                };
            }

            const numDrivesPerGroup = parseInt(
                fields?.numDrivesPerGroup || "0"
            );
            if (isNaN(numDrivesPerGroup)) {
                return {
                    success: false,
                    error: "Drives per group must be a valid number.",
                };
            }

            if (numDrivesPerGroup < 3) {
                return {
                    success: false,
                    error: "Drives per group must be at least 3.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (numDrivesPerGroup - 2) * numOfGroups * capacity,
                    speed: `${numOfGroups}x read/write`,
                    faultTolerance: 2,
                },
            };
        },
    },
    [RaidType.RAIDZ3]: {
        label: "RAIDz3 (Triple parity)",
        hidden: { disks: true },
        additionalFields: {
            numOfDriveGroups: "Number of groups",
            numDrivesPerGroup: "Drives per group",
        },
        calculate(disks, capacity, fields) {
            const numOfGroups = parseInt(fields?.numOfDriveGroups || "0");
            if (isNaN(numOfGroups)) {
                return {
                    success: false,
                    error: "Number of groups must be a valid number.",
                };
            }

            if (numOfGroups < 1) {
                return {
                    success: false,
                    error: "Number of groups must be at least 1.",
                };
            }

            const numDrivesPerGroup = parseInt(
                fields?.numDrivesPerGroup || "0"
            );
            if (isNaN(numDrivesPerGroup)) {
                return {
                    success: false,
                    error: "Drives per group must be a valid number.",
                };
            }

            if (numDrivesPerGroup < 4) {
                return {
                    success: false,
                    error: "Drives per group must be at least 4.",
                };
            }

            return {
                success: true,
                data: {
                    capacity: (numDrivesPerGroup - 3) * numOfGroups * capacity,
                    speed: `${numOfGroups}x read/write`,
                    faultTolerance: 3,
                },
            };
        },
    },
};
