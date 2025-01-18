export enum RaidType {
  RAID_0,
  RAID_1,
  RAID_1E,
  RAID_5,
  RAID_50,
  RAID_5E,
  RAID_5EE,
  RAID_10,
  RAID_6,
  RAID_60,
}

export type RaidHelperResult =
  | {
      success: true;
      data: {
        capacity: number;
        speed: string;
        faultTolerance: number;
        extraDetails: string;
      };
    }
  | { success: false; error: string };

export type AdditionalFields = Record<string, string>;

export type RaidHelper = {
  label: string;
  additionalFields?: AdditionalFields;
  calculate(disks: number, capacity: number, additionalFields?: AdditionalFields): RaidHelperResult;
};

export const raidHelpers: Record<RaidType, RaidHelper> = {
  [RaidType.RAID_0]: {
    label: "RAID 0",
    calculate(disks, capacity) {
      return {
        success: true,
        data: {
          capacity: disks * capacity,
          speed: `${disks}x read and write speed gain`,
          faultTolerance: 0,
          extraDetails: "No fault tolerance. Data is striped across all disks.",
        },
      };
    },
  },
  [RaidType.RAID_1]: {
    label: "RAID 1",
    calculate(disks, capacity) {
      if (disks < 2) {
        return { success: false, error: "RAID 1 requires at least 2 disks." };
      }

      return {
        success: true,
        data: {
          capacity: capacity,
          speed: "Fast",
          faultTolerance: disks - 1,
          extraDetails: "Data is mirrored across all disks. Fault tolerance equals the number of mirrored copies.",
        },
      };
    },
  },
  [RaidType.RAID_1E]: {
    label: "RAID 1E",
    calculate(disks, capacity) {
      if (disks < 3) {
        return { success: false, error: "RAID 1E requires at least 3 disks." };
      }

      return {
        success: true,
        data: {
          capacity: Math.floor(disks / 2) * capacity,
          speed: "Fast",
          faultTolerance: Math.floor(disks / 2),
          extraDetails: "Data is mirrored and striped. Fault tolerance depends on the mirroring structure.",
        },
      };
    },
  },
  [RaidType.RAID_5]: {
    label: "RAID 5",
    calculate(disks, capacity) {
      if (disks < 3) {
        return { success: false, error: "RAID 5 requires at least 3 disks." };
      }

      return {
        success: true,
        data: {
          capacity: (disks - 1) * capacity,
          speed: "Fast",
          faultTolerance: 1,
          extraDetails: "Data is striped with a single parity disk. Fault tolerance is 1 disk failure.",
        },
      };
    },
  },
  [RaidType.RAID_50]: {
    label: "RAID 50",
    additionalFields: {
      parity_raid_count: "Number of RAID 5 groups",
    },
    calculate(disks, capacity, fields) {
      if (disks < 6) {
        return { success: false, error: "RAID 50 requires at least 6 disks." };
      }

      const parityRaidCount = parseInt(fields?.parity_raid_count || "0");
      if (parityRaidCount < 1) {
        return { success: false, error: "Parity RAIDs count must be at least 1." };
      }

      const groupSize = Math.floor(disks / parityRaidCount);
      if (groupSize < 3) {
        return { success: false, error: "Each RAID 5 group must have at least 3 disks." };
      }

      return {
        success: true,
        data: {
          capacity: parityRaidCount * (groupSize - 1) * capacity,
          speed: "Fast",
          faultTolerance: parityRaidCount,
          extraDetails: "Nested RAID with multiple RAID 5 groups.",
        },
      };
    },
  },
  [RaidType.RAID_5E]: {
    label: "RAID 5E",
    calculate(disks, capacity) {
      if (disks < 4) {
        return { success: false, error: "RAID 5E requires at least 4 disks." };
      }

      return {
        success: true,
        data: {
          capacity: (disks - 1) * capacity,
          speed: "Fast",
          faultTolerance: 1,
          extraDetails: "Includes a hot spare disk for faster recovery.",
        },
      };
    },
  },
  [RaidType.RAID_5EE]: {
    label: "RAID 5EE",
    calculate(disks, capacity) {
      if (disks < 5) {
        return { success: false, error: "RAID 5EE requires at least 5 disks." };
      }

      return {
        success: true,
        data: {
          capacity: (disks - 2) * capacity,
          speed: "Fast",
          faultTolerance: 2,
          extraDetails: "Includes distributed hot spares for higher availability.",
        },
      };
    },
  },
  [RaidType.RAID_10]: {
    label: "RAID 10",
    calculate(disks, capacity) {
      if (disks < 4 || disks % 2 !== 0) {
        return { success: false, error: "RAID 10 requires at least 4 disks and an even number of disks." };
      }

      return {
        success: true,
        data: {
          capacity: (disks / 2) * capacity,
          speed: "Fast",
          faultTolerance: disks / 2,
          extraDetails: "Data is mirrored and striped. Fault tolerance is based on the mirroring setup.",
        },
      };
    },
  },
  [RaidType.RAID_6]: {
    label: "RAID 6",
    calculate(disks, capacity) {
      if (disks < 4) {
        return { success: false, error: "RAID 6 requires at least 4 disks." };
      }

      return {
        success: true,
        data: {
          capacity: (disks - 2) * capacity,
          speed: "Fast",
          faultTolerance: 2,
          extraDetails: "Data is striped with dual parity, allowing 2 disk failures.",
        },
      };
    },
  },
  [RaidType.RAID_60]: {
    label: "RAID 60",
    additionalFields: {
      parity_raid_count: "Number of RAID 6 groups",
    },
    calculate(disks, capacity, fields) {
      if (disks < 8) {
        return { success: false, error: "RAID 60 requires at least 8 disks." };
      }

      const parityRaidCount = parseInt(fields?.parity_raid_count ?? "0");
      if (parityRaidCount < 2) {
        return { success: false, error: "Parity RAIDs count must be at least 2." };
      }

      const groupSize = Math.floor(disks / parityRaidCount);
      if (groupSize < 4) {
        return { success: false, error: "Each RAID 6 group must have at least 4 disks." };
      }

      return {
        success: true,
        data: {
          capacity: parityRaidCount * (groupSize - 2) * capacity,
          speed: "Fast",
          faultTolerance: parityRaidCount * 2,
          extraDetails: "Nested RAID with multiple RAID 6 groups.",
        },
      };
    },
  },
};
