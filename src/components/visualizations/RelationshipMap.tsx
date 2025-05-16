
import React, { useEffect, useRef } from 'react';
import { Contact } from "@/types/contact";
import { useIsMobile } from "@/hooks/use-mobile";
import * as d3 from "d3";

interface RelationshipMapProps {
  contact: Contact;
  relatedContacts?: Contact[];
}

const RelationshipMap: React.FC<RelationshipMapProps> = ({ contact, relatedContacts = [] }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isMobile = useIsMobile();
  const containerHeight = isMobile ? 200 : 300;

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup SVG
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = containerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate circle radius based on circle designation
    const getCircleRadius = (circle: string) => {
      switch(circle) {
        case 'inner': return 60;
        case 'middle': return 110;
        case 'outer': return 160;
        default: return 110;
      }
    };

    // Draw outer circles (relationship bands)
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 160)
      .attr("fill", "none")
      .attr("stroke", "#E5DEFF")
      .attr("stroke-width", 20)
      .attr("opacity", 0.5);

    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 110)
      .attr("fill", "none")
      .attr("stroke", "#D3E4FD")
      .attr("stroke-width", 20)
      .attr("opacity", 0.5);

    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 60)
      .attr("fill", "none")
      .attr("stroke", "#FDE1D3")
      .attr("stroke-width", 20)
      .attr("opacity", 0.5);

    // Labels for circles
    const labels = [
      { text: "Inner", y: centerY - 60 - 10, textAnchor: "middle", fontSize: "12px" },
      { text: "Middle", y: centerY - 110 - 10, textAnchor: "middle", fontSize: "12px" },
      { text: "Outer", y: centerY - 160 - 10, textAnchor: "middle", fontSize: "12px" }
    ];

    labels.forEach(label => {
      svg.append("text")
        .attr("x", centerX)
        .attr("y", label.y)
        .attr("text-anchor", label.textAnchor)
        .attr("font-size", label.fontSize)
        .attr("fill", "#888")
        .text(label.text);
    });

    // Main contact (always in the center)
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 30)
      .attr("fill", "#9b87f5")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Main contact label
    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY + 50)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("You");

    // Add related contacts if available
    if (relatedContacts && relatedContacts.length > 0) {
      const angleStep = (2 * Math.PI) / relatedContacts.length;
      
      relatedContacts.forEach((relContact, i) => {
        const angle = i * angleStep;
        const radius = getCircleRadius(relContact.circle);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Draw contact node
        svg.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 20)
          .attr("fill", relContact.circle === "inner" ? "#FDE1D3" : 
                        relContact.circle === "middle" ? "#D3E4FD" : "#E5DEFF")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
          
        // Draw contact name
        svg.append("text")
          .attr("x", x)
          .attr("y", y + 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .text(relContact.name.split(" ")[0]);
      });
    }
    
    // Add focal contact
    if (contact) {
      // Draw connection line to center
      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", centerX + getCircleRadius(contact.circle))
        .attr("y2", centerY)
        .attr("stroke", "#9b87f5")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");
        
      // Draw contact node
      svg.append("circle")
        .attr("cx", centerX + getCircleRadius(contact.circle))
        .attr("cy", centerY)
        .attr("r", 25)
        .attr("fill", contact.circle === "inner" ? "#FDE1D3" : 
                      contact.circle === "middle" ? "#D3E4FD" : "#E5DEFF")
        .attr("stroke", "#9b87f5")
        .attr("stroke-width", 2);
        
      // Draw contact name
      svg.append("text")
        .attr("x", centerX + getCircleRadius(contact.circle))
        .attr("y", centerY + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(contact.name.split(" ")[0]);
    }

  }, [contact, relatedContacts, containerHeight]);

  return (
    <div className="w-full">
      <svg 
        ref={svgRef} 
        width="100%" 
        height={containerHeight} 
        className="overflow-visible"
      />
    </div>
  );
};

export default RelationshipMap;
