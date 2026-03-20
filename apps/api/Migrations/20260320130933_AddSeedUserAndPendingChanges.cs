using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookReading.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedUserAndPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 20, 13, 9, 32, 609, DateTimeKind.Utc).AddTicks(9761), new DateTime(2026, 3, 20, 13, 9, 32, 609, DateTimeKind.Utc).AddTicks(9766) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 3, 20, 13, 8, 14, 197, DateTimeKind.Utc).AddTicks(508), new DateTime(2026, 3, 20, 13, 8, 14, 197, DateTimeKind.Utc).AddTicks(513) });
        }
    }
}
